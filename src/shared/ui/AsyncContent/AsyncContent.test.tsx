import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/shared/api';
import { AsyncContent } from './AsyncContent';

const skeleton = <div>SKELETON</div>;
const empty = <div>EMPTY</div>;
const children = <div>CONTENT</div>;

const shown = () => {
  if (screen.queryByText('SKELETON')) return 'skeleton';
  if (screen.queryByText('CONTENT')) return 'content';
  if (screen.queryByText('EMPTY')) return 'empty';
  if (screen.queryByText('Не удалось загрузить данные')) return 'error';
  return 'none';
};

const renderAC = (props: Partial<React.ComponentProps<typeof AsyncContent>>) =>
  render(
    <AsyncContent status="success" isEmpty={false} skeleton={skeleton} empty={empty} {...props}>
      {children}
    </AsyncContent>,
  );

describe('<AsyncContent> precedence', () => {
  it('loading + нет данных → skeleton', () => {
    renderAC({ status: 'loading', isEmpty: true });
    expect(shown()).toBe('skeleton');
  });

  it('loading + есть данные (stale-while-revalidate) → content', () => {
    renderAC({ status: 'loading', isEmpty: false });
    expect(shown()).toBe('content');
  });

  it('loading + post-filter пусто, но данные есть (hasData) → empty, не skeleton', () => {
    // ReviewsCard: авторы загружены, но фильтр команды дал 0 строк.
    renderAC({ status: 'loading', isEmpty: true, hasData: true });
    expect(shown()).toBe('empty');
  });

  it('error + нет данных + error передан → ErrorState', () => {
    renderAC({
      status: 'error',
      isEmpty: true,
      error: new ApiError({ status: 500, type: 'about:blank', title: 'boom' }),
    });
    expect(shown()).toBe('error');
  });

  it('error + нет данных + error НЕ передан → empty (виджеты без error-UI, напр. профиль)', () => {
    renderAC({ status: 'error', isEmpty: true });
    expect(shown()).toBe('empty');
  });

  it('error + есть данные → content (не теряем уже показанное)', () => {
    renderAC({
      status: 'error',
      isEmpty: false,
      error: new ApiError({ status: 500, type: 'about:blank', title: 'boom' }),
    });
    expect(shown()).toBe('content');
  });

  it('success + isEmpty → empty', () => {
    renderAC({ status: 'success', isEmpty: true });
    expect(shown()).toBe('empty');
  });

  it('success + есть данные → content', () => {
    renderAC({ status: 'success', isEmpty: false });
    expect(shown()).toBe('content');
  });

  it('idle + isEmpty → empty', () => {
    renderAC({ status: 'idle', isEmpty: true });
    expect(shown()).toBe('empty');
  });

  it('onRetry прокидывается в ErrorState и кликается', async () => {
    const onRetry = vi.fn();
    renderAC({
      status: 'error',
      isEmpty: true,
      error: new ApiError({ status: 500, type: 'about:blank', title: 'boom' }),
      onRetry,
    });
    await userEvent.click(screen.getByRole('button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
