/**
 * Экспорт SVG-графика (Recharts) в PNG.
 *
 * Recharts рендерит чистый SVG, но красит через CSS-классы и `var(--ant-*)`.
 * При сериализации SVG теряет внешние стили, поэтому инлайним вычисленные
 * значения ключевых presentational-свойств в каждый узел.
 */

const INLINED_PROPS = [
  'fill',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'opacity',
  'fill-opacity',
  'stroke-opacity',
  'font-family',
  'font-size',
  'font-weight',
  'text-anchor',
] as const;

function inlineStyles(source: Element, target: Element): void {
  const computed = window.getComputedStyle(source);
  const decl = INLINED_PROPS.map((prop) => {
    const v = computed.getPropertyValue(prop);
    return v ? `${prop}:${v}` : '';
  })
    .filter(Boolean)
    .join(';');
  if (decl) target.setAttribute('style', decl);

  const srcChildren = source.children;
  const tgtChildren = target.children;
  for (let i = 0; i < srcChildren.length; i++) {
    const s = srcChildren[i];
    const t = tgtChildren[i];
    if (s && t) inlineStyles(s, t);
  }
}

/**
 * Конвертирует `<svg>` в PNG и скачивает.
 *
 * @param svg     исходный SVG-элемент (из DOM)
 * @param filename имя файла
 * @param scale   множитель разрешения (2 = retina-чёткость)
 * @param background цвет фона PNG (SVG прозрачный)
 */
export async function downloadSvgAsPng(
  svg: SVGSVGElement,
  filename: string,
  options: { scale?: number; background?: string } = {},
): Promise<void> {
  const scale = options.scale ?? 2;
  const background = options.background ?? '#ffffff';

  const rect = svg.getBoundingClientRect();
  const width = rect.width || svg.clientWidth || 800;
  const height = rect.height || svg.clientHeight || 400;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  inlineStyles(svg, clone);

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const img = await loadImage(svgUrl);
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context недоступен');

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Не удалось отрендерить SVG в изображение'));
    img.src = src;
  });
}
