import { useMemo } from 'react';
import { Select, Typography } from 'antd';
import { UserAvatar, userDisplayName, type AuthorActivity } from '@/entities/user';

interface CompareSelectorProps {
  /** Все доступные авторы (из dashboard за период). */
  options: readonly AuthorActivity[];
  /** Выбранные email. */
  selected: readonly string[];
  onChange: (emails: string[]) => void;
  max?: number;
}

/**
 * Мультиселект авторов для сравнения. Лимит — нативный `maxCount` AntD,
 * опции с аватаром + именем, поиск по имени/email.
 */
export function CompareSelector({
  options,
  selected,
  onChange,
  max = 3,
}: CompareSelectorProps) {
  const selectOptions = useMemo(
    () =>
      options.map((a) => ({
        value: a.email,
        label: userDisplayName({ name: a.displayName ?? null, username: null, email: a.email }),
        author: a,
      })),
    [options],
  );

  return (
    <Select
      mode="multiple"
      value={selected as string[]}
      onChange={onChange}
      options={selectOptions}
      placeholder={`Выберите до ${max} разработчиков для сравнения`}
      style={{ width: '100%', maxWidth: 640 }}
      size="large"
      maxCount={max}
      maxTagCount="responsive"
      optionFilterProp="label"
      filterOption={(input, option) => {
        const q = input.toLowerCase();
        const a = option?.author;
        if (!a) return false;
        return (
          a.email.toLowerCase().includes(q) ||
          (a.displayName?.toLowerCase().includes(q) ?? false)
        );
      }}
      optionRender={(opt) => {
        const a = opt.data.author;
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <UserAvatar
              user={{
                name: a.displayName ?? null,
                username: null,
                email: a.email,
                avatarUrl: a.avatarUrl ?? null,
              }}
              size={24}
              isLead={a.isLead}
            />
            <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span>{userDisplayName({ name: a.displayName ?? null, username: null, email: a.email })}</span>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {a.email}
              </Typography.Text>
            </span>
          </span>
        );
      }}
      notFoundContent="Никого не найдено"
    />
  );
}
