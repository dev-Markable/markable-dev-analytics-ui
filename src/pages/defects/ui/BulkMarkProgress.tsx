import { useEffect, useRef, useState } from 'react';
import { Modal, Progress, Typography } from 'antd';

/** Kaiten пишется глобально ~4 карточки/сек (rate-limit) — по этому темпу оцениваем длительность. */
const RATE_PER_SEC = 4;

interface BulkMarkProgressProps {
  open: boolean;
  /** Сколько карточек в пачке — для оценки времени. */
  total: number;
}

/**
 * Прогресс bulk-простановки AI-Agent. Бэк пишет синхронно и отдаёт результат только в конце,
 * поэтому реального %-прогресса нет — показываем оценку по времени (total / ~4 карт/сек).
 * Бар доходит до ~95% за оценочное время и закрывается, когда родитель снимает `open`
 * (запрос завершился). Не блокирует по-настоящему, но даёт понятный фидбэк на минуты ожидания.
 */
export function BulkMarkProgress({ open, total }: BulkMarkProgressProps) {
  const [percent, setPercent] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setPercent(0);
      return;
    }
    const estMs = Math.max(1000, (total / RATE_PER_SEC) * 1000);
    startRef.current = Date.now();
    setPercent(0);
    const timer = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setPercent(Math.min(95, Math.round((elapsed / estMs) * 95)));
    }, 300);
    return () => clearInterval(timer);
  }, [open, total]);

  const estSec = Math.max(1, Math.ceil(total / RATE_PER_SEC));

  return (
    <Modal
      open={open}
      title="Простановка AI-Agent"
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
    >
      <Progress percent={percent} status="active" />
      <Typography.Text type="secondary">
        Обновляем {total} карточек в Kaiten (~{estSec}&nbsp;с). Не закрывайте страницу.
      </Typography.Text>
    </Modal>
  );
}
