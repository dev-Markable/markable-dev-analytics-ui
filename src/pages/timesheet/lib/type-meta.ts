export interface TypeMeta {
  label: string;
  mod: 'defect' | 'development' | 'other';
}

const OTHER: TypeMeta = { label: 'Прочее', mod: 'other' };

/** Тип карточки Kaiten → подпись и модификатор цвета (точка в списке, сегмент бара). */
const TYPE_META: Record<string, TypeMeta> = {
  DEFECT: { label: 'Дефект', mod: 'defect' },
  DEVELOPMENT: { label: 'Разработка', mod: 'development' },
  TASK: { label: 'Задача', mod: 'other' },
  OTHER,
};

export const typeMeta = (type: string | null | undefined): TypeMeta =>
  (type ? TYPE_META[type] : undefined) ?? OTHER;
