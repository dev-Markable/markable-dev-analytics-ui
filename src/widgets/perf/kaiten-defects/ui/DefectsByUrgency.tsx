import { Flame } from "lucide-react";
import type { DefectsSummary } from "@/entities/performance-review";
import { formatNumber } from "@/shared/lib";
import { EmptyState, SectionCard, StatTile } from "@/shared/ui";
import { URGENCY_SPECS } from "../config/urgency";

interface DefectsByUrgencyProps {
  defects: DefectsSummary;
}

export function DefectsByUrgency({ defects }: DefectsByUrgencyProps) {
  const { total, inWork, closed, criticalHigh, byUrgency } = defects;
  const isEmpty = total === 0;

  return (
    <SectionCard
      title="Дефекты по срочности"
      icon={<Flame size={16} />}
      description="Снапшот по карточкам Kaiten — закрытые в периоде и сейчас в работе"
    >
      {isEmpty ? (
        <EmptyState
          title="Дефектов нет"
          description="За период на этом человеке не было карточек-дефектов."
        />
      ) : (
        <div className="perf-card">
          <div className="perf-card__tiles">
            {/* «Горящие» — единственная плитка с акцентом: остальные три просто
                раскладывают то же множество, а эта требует реакции. */}
            <div className="kaiten-defects__hot">
              <StatTile
                variant="inset"
                value={formatNumber(criticalHigh)}
                label="горящих"
                hint="критичный + высокий"
              />
            </div>
            <StatTile
              variant="inset"
              value={formatNumber(inWork)}
              label="в работе"
            />
            <StatTile
              variant="inset"
              value={formatNumber(closed)}
              label="закрыто"
            />
            <StatTile
              variant="inset"
              value={formatNumber(total)}
              label="всего"
            />
          </div>

          <div className="kaiten-defects__spread">
            <span className="kaiten-defects__caption">
              Распределение по срочности
            </span>
            <div
              className="kaiten-defects__bar"
              role="img"
              aria-label={`Распределение ${total} дефектов по срочности`}
            >
              {URGENCY_SPECS.map((spec) => {
                const count = byUrgency[spec.key];
                if (!count) return null;
                return (
                  <span
                    key={spec.key}
                    className="kaiten-defects__seg"
                    // flex-grow вместо width в процентах: сегменты сами делят ширину,
                    // и зазоры между ними не съедают проценты.
                    style={{ flexGrow: count, background: spec.color }}
                    title={`${spec.label}: ${count}`}
                  />
                );
              })}
            </div>

            <ul className="kaiten-defects__legend">
              {URGENCY_SPECS.map((spec) => {
                const count = byUrgency[spec.key];
                if (!count) return null;
                return (
                  <li key={spec.key} className="kaiten-defects__legend-item">
                    <i style={{ background: spec.color }} />
                    <span>{spec.label}</span>
                    <strong>{formatNumber(count)}</strong>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
