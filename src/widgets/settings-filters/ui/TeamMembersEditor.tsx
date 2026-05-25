import { useState } from 'react';
import { App, Button, Input, Tag, Typography } from 'antd';
import { Plus, RotateCcw, X } from 'lucide-react';
import {
  isEmailValid,
  useTeamMembersStore,
} from '@/features/team-filter';

export function TeamMembersEditor() {
  const members = useTeamMembersStore((s) => s.members);
  const add = useTeamMembersStore((s) => s.add);
  const remove = useTeamMembersStore((s) => s.remove);
  const reset = useTeamMembersStore((s) => s.reset);
  const { modal, message } = App.useApp();

  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (): void => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Введите email');
      return;
    }
    if (!isEmailValid(trimmed)) {
      setError('Некорректный email');
      return;
    }
    const added = add(trimmed);
    if (!added) {
      setError('Такой email уже в списке');
      return;
    }
    setDraft('');
    setError(null);
    void message.success(`${trimmed} добавлен`);
  };

  const handleRemove = (email: string): void => {
    remove(email);
    void message.info(`${email} удалён`);
  };

  const handleReset = (): void => {
    modal.confirm({
      title: 'Восстановить дефолтный список?',
      content: 'Все добавленные email-ы будут удалены, дефолтные — восстановлены.',
      okText: 'Восстановить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: () => {
        reset();
        void message.success('Список восстановлен');
      },
    });
  };

  return (
    <div className="team-editor">
      <div className="team-editor__list">
        {members.length === 0 ? (
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Список пуст. Добавьте email ниже.
          </Typography.Text>
        ) : (
          members.map((email) => (
            <Tag
              key={email}
              bordered={false}
              className="team-editor__chip"
              closeIcon={<X size={11} strokeWidth={2.5} />}
              onClose={(e) => {
                e.preventDefault();
                handleRemove(email);
              }}
            >
              {email}
            </Tag>
          ))
        )}
      </div>

      <div className="team-editor__form">
        <Input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onPressEnter={handleAdd}
          placeholder="email@x5.ru"
          status={error ? 'error' : undefined}
          style={{ maxWidth: 320 }}
        />
        <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>
          Добавить
        </Button>
        <Button type="text" icon={<RotateCcw size={14} />} onClick={handleReset}>
          К дефолту
        </Button>
      </div>

      {error && (
        <Typography.Text type="danger" style={{ fontSize: 12 }}>
          {error}
        </Typography.Text>
      )}
    </div>
  );
}
