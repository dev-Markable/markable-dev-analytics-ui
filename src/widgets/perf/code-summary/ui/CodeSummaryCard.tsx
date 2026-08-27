import { Code2 } from "lucide-react";
import type { PerformanceMetrics } from "@/entities/performance-review";
import { formatNumber } from "@/shared/lib";
import { RatioBar, SectionCard, StatTile } from "@/shared/ui";
import { toTileDelta } from "@/widgets/perf/shared";
import { testRatio } from "../lib/test-ratio";

interface CodeSummaryCardProps {
  metrics: PerformanceMetrics;
}

export function CodeSummaryCard({ metrics }: CodeSummaryCardProps) {
  const added = metrics.addedLines.current;
  const deleted = metrics.deletedLines.current;
  const tests = metrics.testAddedLines.current;
  const testPct = testRatio(tests, added);

  return (
    <SectionCard
      title="Код"
      icon={<Code2 size={16} />}
      description="Объём коммитов и строк за период"
    >
      <div className="perf-card">
        <div className="perf-card__tiles">
          <StatTile
            variant="inset"
            size="lg"
            value={formatNumber(metrics.commits.current)}
            label="коммитов"
            hint={`без merge: ${formatNumber(metrics.nonMergeCommits.current)}`}
            delta={toTileDelta(metrics.commits)}
          />
          <StatTile
            variant="inset"
            size="lg"
            value={formatNumber(added)}
            label="строк добавлено"
            hint={
              testPct != null
                ? `${formatNumber(tests)} строк тестов — ${testPct}% от добавленного`
                : `${formatNumber(tests)} строк тестов`
            }
            delta={toTileDelta(metrics.addedLines)}
          />
        </div>

        <RatioBar
          caption="Распределение изменённых строк"
          segments={[
            {
              key: "added",
              label: "Добавлено",
              value: added,
              tone: "success",
              inlineLabel: `+${formatNumber(added)}`,
            },
            {
              key: "deleted",
              label: "Удалено",
              value: deleted,
              tone: "error",
              inlineLabel: `−${formatNumber(deleted)}`,
            },
          ]}
          legend={false}
          emptyText="За период строки не менялись"
        />
      </div>
    </SectionCard>
  );
}
