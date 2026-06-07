import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RunStatusTag } from './RunStatusTag';

describe('RunStatusTag', () => {
  it('CANCELLED → метка «Отменён»', () => {
    render(<RunStatusTag status="CANCELLED" />);
    expect(screen.getByText('Отменён')).toBeInTheDocument();
  });

  it('RUNNING → метка «Выполняется»', () => {
    render(<RunStatusTag status="RUNNING" />);
    expect(screen.getByText('Выполняется')).toBeInTheDocument();
  });
});
