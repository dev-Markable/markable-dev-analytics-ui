import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Download, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';

export interface ExportButtonProps {
  /** CSV-экспорт. Если не задан — пункт скрыт. */
  onExportCsv?: () => void;
  /** PNG-экспорт. Если не задан — пункт скрыт. */
  onExportPng?: () => void;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
}

/**
 * Кнопка экспорта. Если доступен только один формат — простая кнопка,
 * если оба — dropdown. Ничего не рендерит, если не задано ни одного хендлера.
 */
export function ExportButton({
  onExportCsv,
  onExportPng,
  size = 'middle',
  disabled,
}: ExportButtonProps) {
  const hasCsv = Boolean(onExportCsv);
  const hasPng = Boolean(onExportPng);

  if (!hasCsv && !hasPng) return null;

  // Один формат — простая кнопка без меню.
  if (hasCsv !== hasPng) {
    const single = hasCsv
      ? { label: 'CSV', icon: <FileSpreadsheet size={14} />, onClick: onExportCsv }
      : { label: 'PNG', icon: <ImageIcon size={14} />, onClick: onExportPng };
    return (
      <Button size={size} icon={single.icon} onClick={single.onClick} disabled={disabled}>
        {single.label}
      </Button>
    );
  }

  const items: MenuProps['items'] = [
    {
      key: 'csv',
      label: 'Скачать CSV',
      icon: <FileSpreadsheet size={14} />,
      onClick: onExportCsv,
    },
    {
      key: 'png',
      label: 'Скачать PNG',
      icon: <ImageIcon size={14} />,
      onClick: onExportPng,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} disabled={disabled}>
      <Button size={size} icon={<Download size={14} />}>
        Экспорт
      </Button>
    </Dropdown>
  );
}
