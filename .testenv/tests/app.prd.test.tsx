import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import type { GlobalStats, Todo } from '../../src/types';

const defaultStats: GlobalStats = {
  totalCount: 0,
  totalDuration: 0,
  dailyStats: {},
};

const seedTodos = (todos: Todo[]) => {
  localStorage.setItem('focus_todos', JSON.stringify(todos));
};

const seedStats = (stats: GlobalStats = defaultStats) => {
  localStorage.setItem('focus_global_stats', JSON.stringify(stats));
};

const openAddPage = async (user: ReturnType<typeof userEvent.setup>) => {
  const header = screen.getByRole('banner');
  const buttons = within(header).getAllByRole('button');
  await user.click(buttons[1]);
};

describe('FocusTodo PRD 自动化测试', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('PRD-添加页: 可以添加任务并显示在清单中', async () => {
    const user = userEvent.setup();

    render(<App />);
    expect(screen.getByText('暂无待办，点击右上角添加')).toBeInTheDocument();

    await openAddPage(user);
    expect(screen.getByText('添加待办')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('请输入待办名称'), '复习高数');
    await user.click(screen.getByRole('button', { name: '学习' }));
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(screen.getByText('待办清单')).toBeInTheDocument();
    expect(screen.getByText('复习高数')).toBeInTheDocument();
    expect(screen.getByText('学习')).toBeInTheDocument();
  });

  it('PRD-添加页: 任务名称为空时禁止保存', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openAddPage(user);

    const saveButton = screen.getByRole('button', { name: '保存' });
    expect(saveButton).toBeDisabled();
  });

  it('PRD-详情页/编辑页: 可以编辑已有任务', async () => {
    const user = userEvent.setup();
    seedTodos([
      {
        id: 'todo-1',
        name: '旧任务',
        category: '工作',
        color: '#ffb381',
        totalCount: 0,
        totalDuration: 0,
        wallpaperIndex: 0,
      },
    ]);
    seedStats();

    render(<App />);

    await user.click(screen.getByText('旧任务'));
    await user.click(screen.getByRole('button', { name: '编辑' }));

    const input = screen.getByPlaceholderText('请输入待办名称');
    await user.clear(input);
    await user.type(input, '新任务');
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(screen.getByText('新任务')).toBeInTheDocument();
    expect(screen.queryByText('旧任务')).not.toBeInTheDocument();
  });

  it('PRD-详情页: 删除任务后从清单移除', async () => {
    const user = userEvent.setup();
    seedTodos([
      {
        id: 'todo-2',
        name: '删除目标',
        category: '学习',
        color: '#fce35a',
        totalCount: 0,
        totalDuration: 0,
        wallpaperIndex: 0,
      },
    ]);
    seedStats();

    render(<App />);

    await user.click(screen.getByText('删除目标'));
    await user.click(screen.getByRole('button', { name: '删除' }));

    expect(screen.getByText('暂无待办，点击右上角添加')).toBeInTheDocument();
    expect(screen.queryByText('删除目标')).not.toBeInTheDocument();
  });

  it('PRD-计时页/统计页: 保存专注后统计数据会更新', async () => {
    const user = userEvent.setup();

    seedTodos([
      {
        id: 'todo-3',
        name: '番茄钟任务',
        category: '工作',
        color: '#ffb381',
        totalCount: 0,
        totalDuration: 0,
        wallpaperIndex: 0,
      },
    ]);
    seedStats();

    render(<App />);

    await user.click(screen.getByRole('button', { name: '开始' }));
    const timerFooter = document.querySelector('footer');
    if (!timerFooter) {
      throw new Error('Timer footer not found');
    }

    const timerButtons = within(timerFooter).getAllByRole('button');
    await user.click(timerButtons[2]);

    expect(screen.getByText('待办清单')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '统计' }));

    expect(screen.getByText('待办专注统计')).toBeInTheDocument();
    expect(screen.getAllByText('1次').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0分钟').length).toBeGreaterThan(0);
  });

  it('PRD-本地存储: 任务数据刷新后仍可恢复', async () => {
    const user = userEvent.setup();

    const { unmount } = render(<App />);
    await openAddPage(user);
    await user.type(screen.getByPlaceholderText('请输入待办名称'), '晨间复盘');
    await user.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      const savedTodos = localStorage.getItem('focus_todos');
      expect(savedTodos).toContain('晨间复盘');
    });

    unmount();
    render(<App />);

    expect(screen.getByText('晨间复盘')).toBeInTheDocument();
  });
});
