#!/usr/bin/env node
/**
 * Генерация TypeScript-типов из OpenAPI-контрактов devpulse-oas.
 *
 * Источник YAML — два режима:
 *   1. **Remote (default)** — `https://raw.githubusercontent.com/<repo>/<ref>/...`.
 *      Версия пинится в `.openapi-config.json`:
 *        - `ref` — глобальный fallback (branch / tag / commit SHA).
 *        - `refs.<contract>` — per-contract override, аналог
 *          `<devpulse-oas.<contract>.version>` в `adapter-rest/pom.xml` бэка.
 *      Для приватного репо нужен `OAS_GITHUB_TOKEN` (или `GITHUB_TOKEN` в CI)
 *      с правом `repo:read`.
 *
 *   2. **Local (override)** — если `OAS_DIR` задан, читаем YAML из локального чекаута.
 *      Удобно для разработчиков, которые правят OAS параллельно с фронтом.
 *
 * Алгоритм:
 *   1. Берём 6 YAML (shared + 5 domain контрактов) из источника, кладём в `.openapi-cache/`,
 *      чтобы `$ref: 'shared.yaml#/...'` корректно резолвились (все рядом).
 *   2. Для каждого запускаем `openapi-typescript` → `src/shared/api/generated/<name>.ts`.
 *
 * Сгенеренные `.ts` коммитятся — CI codegen не запускает.
 * Бамп OAS = поправь `.openapi-config.json` → `npm run gen:api` → проверь diff → коммит.
 */
import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONFIG_PATH = resolve(ROOT, '.openapi-config.json');
if (!existsSync(CONFIG_PATH)) {
  console.error(`✗ Не найден ${CONFIG_PATH}`);
  process.exit(1);
}
const CONFIG = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));

const CACHE = resolve(ROOT, '.openapi-cache');
const GEN = resolve(ROOT, 'src/shared/api/generated');

const LOCAL_DIR = process.env.OAS_DIR;
const TOKEN = process.env.OAS_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN ?? '';

const CONTRACTS = [
  { name: 'shared', dir: 'shared-contract', file: 'shared.yaml' },
  { name: 'collection', dir: 'collection-contract', file: 'collection-api.yaml' },
  { name: 'dashboard', dir: 'dashboard-contract', file: 'dashboard-api.yaml' },
  { name: 'stats', dir: 'stats-contract', file: 'stats-api.yaml' },
  { name: 'users', dir: 'users-contract', file: 'users-api.yaml' },
  { name: 'kaiten', dir: 'kaiten-contract', file: 'kaiten-api.yaml' },
];

/**
 * Возвращает ref для конкретного контракта.
 * Приоритет: `refs.<name>` → `ref` → `'main'`.
 */
function refFor(name) {
  return CONFIG.refs?.[name] ?? CONFIG.ref ?? 'main';
}

async function fetchYaml({ name, dir, file }) {
  const subpath = `${dir}/src/main/resources/openapi/${file}`;

  if (LOCAL_DIR) {
    const abs = resolve(ROOT, LOCAL_DIR, subpath);
    if (!existsSync(abs)) {
      throw new Error(`Local mode: не найден ${abs}`);
    }
    return readFileSync(abs, 'utf8');
  }

  const ref = refFor(name);
  const url = `https://raw.githubusercontent.com/${CONFIG.repo}/${ref}/${subpath}`;
  const headers = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const hint =
      res.status === 404
        ? `Проверь \`refs.${name}\` (или \`ref\`) в .openapi-config.json.`
        : res.status === 401 || res.status === 403
          ? 'Приватный репо? Поставь `OAS_GITHUB_TOKEN` с правом `repo:read`.'
          : '';
    throw new Error(`GitHub ${res.status} ${res.statusText}\nURL: ${url}\n${hint}`);
  }
  return await res.text();
}

function bullet(msg) {
  console.log(`  ${msg}`);
}

if (LOCAL_DIR) {
  console.log(`📂 Local mode: OAS_DIR=${resolve(ROOT, LOCAL_DIR)}`);
} else {
  console.log(`🌐 Remote: ${CONFIG.repo}${TOKEN ? ' (with token)' : ' (no token)'}`);
  // Показываем эффективные refs — удобно когда они расходятся.
  const uniqueRefs = new Set(CONTRACTS.map((c) => refFor(c.name)));
  if (uniqueRefs.size === 1) {
    console.log(`   ref: ${[...uniqueRefs][0]} (одинаковый для всех контрактов)`);
  } else {
    console.log('   refs:');
    for (const c of CONTRACTS) {
      console.log(`     ${c.name.padEnd(11)} @ ${refFor(c.name)}`);
    }
  }
}

if (existsSync(CACHE)) rmSync(CACHE, { recursive: true });
mkdirSync(CACHE, { recursive: true });
mkdirSync(GEN, { recursive: true });

console.log(`\n📋 Загружаем ${CONTRACTS.length} спек:`);
for (const c of CONTRACTS) {
  bullet(`${c.file}`);
  try {
    const yaml = await fetchYaml(c);
    writeFileSync(resolve(CACHE, c.file), yaml);
  } catch (e) {
    console.error(`\n✗ ${c.file}: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}

console.log('\n⚙️  Генерим типы:');
for (const c of CONTRACTS) {
  process.stdout.write(`  ${c.name}.ts ... `);
  try {
    execSync(
      `npx --yes openapi-typescript "${resolve(CACHE, c.file)}" --output "${resolve(GEN, c.name + '.ts')}"`,
      { stdio: ['ignore', 'pipe', 'pipe'], cwd: ROOT },
    );
    console.log('ok');
  } catch (e) {
    console.log('FAILED');
    const err = e instanceof Error ? e.message : String(e);
    console.error(err);
    process.exit(1);
  }
}

console.log('\n✅ Готово:');
for (const f of readdirSync(GEN)) {
  console.log(`   src/shared/api/generated/${f}`);
}
