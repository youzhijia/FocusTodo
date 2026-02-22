/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  BarChart2, 
  ArrowLeft, 
  Play, 
  X, 
  Pause, 
  Check, 
  Edit2, 
  Archive, 
  Trash2,
  Timer as TimerIcon,
  ListTodo,
  PieChart,
  User
} from 'lucide-react';
import { 
  Todo, 
  GlobalStats, 
  CATEGORIES, 
  THEME_BLUE, 
  HEADER_BLUE,
  ACTIVE_BLUE,
  BG_LIGHT_BLUE,
  ARCHIVE_GREEN, 
  DELETE_RED, 
  Page 
} from './types';

// Helper to format time
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  }
  return `${mins}分钟`;
};

export default function App() {
  // State
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('focus_todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [globalStats, setGlobalStats] = useState<GlobalStats>(() => {
    const saved = localStorage.getItem('focus_global_stats');
    return saved ? JSON.parse(saved) : {
      totalCount: 0,
      totalDuration: 0,
      dailyStats: {}
    };
  });

  const [currentPage, setCurrentPage] = useState<Page>('list');
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<Partial<Todo> | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('focus_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('focus_global_stats', JSON.stringify(globalStats));
  }, [globalStats]);

  // Computed
  const selectedTodo = useMemo(() => 
    todos.find(t => t.id === selectedTodoId), 
    [todos, selectedTodoId]
  );

  // Actions
  const handleAddTodo = (todo: Omit<Todo, 'id' | 'totalCount' | 'totalDuration'>) => {
    const newTodo: Todo = {
      ...todo,
      id: Math.random().toString(36).substr(2, 9),
      totalCount: 0,
      totalDuration: 0
    };
    setTodos([...todos, newTodo]);
    setCurrentPage('list');
  };

  const handleUpdateTodo = (updatedTodo: Todo) => {
    setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
    setCurrentPage('list');
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
    setCurrentPage('list');
  };

  const handleArchiveTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
    setCurrentPage('list');
  };

  const handleSaveSession = (id: string, duration: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Update Todo stats
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          totalCount: t.totalCount + 1,
          totalDuration: t.totalDuration + duration
        };
      }
      return t;
    }));

    // Update Global stats
    setGlobalStats(prev => {
      const todayStats = prev.dailyStats[today] || { count: 0, duration: 0 };
      return {
        ...prev,
        totalCount: prev.totalCount + 1,
        totalDuration: prev.totalDuration + duration,
        dailyStats: {
          ...prev.dailyStats,
          [today]: {
            count: todayStats.count + 1,
            duration: todayStats.duration + duration
          }
        }
      };
    });

    setCurrentPage('list');
  };

  // Render Helpers
  const renderHeader = (title: string, left?: React.ReactNode, right?: React.ReactNode) => (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-16 shadow-sm" style={{ backgroundColor: HEADER_BLUE }}>
      <div className="w-10 flex justify-start">{left}</div>
      <h1 className="text-white text-lg font-bold">{title}</h1>
      <div className="w-10 flex justify-end">{right}</div>
    </header>
  );

  const renderBottomNav = (active: 'list' | 'stats' | 'profile') => (
    <nav className="h-20 bg-white border-t border-slate-100 flex items-center justify-around px-6 pb-4">
      <button 
        onClick={() => setCurrentPage('list')}
        className={`flex flex-col items-center gap-1 ${active === 'list' ? 'text-[#89d0ec]' : 'text-slate-400'}`}
      >
        <div className="flex h-8 items-center justify-center">
          <motion.div animate={{ scale: active === 'list' ? 1.1 : 1 }}>
            <Plus size={24} className={active === 'list' ? 'rotate-45' : ''} style={{ display: active === 'list' ? 'none' : 'block' }} />
            <div className="w-6 h-6 border-2 border-current rounded-sm flex items-center justify-center" style={{ display: active === 'list' ? 'flex' : 'none' }}>
              <div className="w-3 h-0.5 bg-current" />
            </div>
            {/* Using icons from lucide that match the intent */}
            {active === 'list' ? <Check size={24} /> : <Plus size={24} />}
          </motion.div>
        </div>
        <span className="text-xs font-medium">待办</span>
      </button>
      
      <button 
        onClick={() => setCurrentPage('stats')}
        className={`flex flex-col items-center gap-1 ${active === 'stats' ? 'text-[#89d0ec]' : 'text-slate-400'}`}
      >
        <div className="flex h-8 items-center justify-center">
          <BarChart2 size={24} fill={active === 'stats' ? 'currentColor' : 'none'} />
        </div>
        <span className="text-xs font-medium">统计</span>
      </button>

      <button 
        className={`flex flex-col items-center gap-1 text-slate-400`}
      >
        <div className="flex h-8 items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
            <div className="w-2 h-2 bg-current rounded-full" />
          </div>
        </div>
        <span className="text-xs font-medium">我的</span>
      </button>
    </nav>
  );

  // Refined Bottom Nav to match images better
  const BottomNav = ({ active }: { active: 'list' | 'stats' | 'profile' }) => (
    <nav className="h-20 bg-white border-t border-slate-50 flex items-center justify-around px-4 pb-2">
      <button 
        onClick={() => setCurrentPage('list')}
        className={`flex flex-col items-center gap-1 flex-1 ${active === 'list' ? 'text-[#5ebcf3]' : 'text-slate-300'}`}
      >
        <div className="h-8 flex items-center justify-center">
          <motion.div whileTap={{ scale: 0.9 }}>
            <ListTodo size={24} strokeWidth={active === 'list' ? 2.5 : 2} />
          </motion.div>
        </div>
        <span className="text-[10px] font-bold">待办</span>
      </button>

      <button 
        onClick={() => setCurrentPage('stats')}
        className={`flex flex-col items-center gap-1 flex-1 ${active === 'stats' ? 'text-[#5ebcf3]' : 'text-slate-300'}`}
      >
        <div className="h-8 flex items-center justify-center">
          <motion.div whileTap={{ scale: 0.9 }}>
            <PieChart size={24} strokeWidth={active === 'stats' ? 2.5 : 2} />
          </motion.div>
        </div>
        <span className="text-[10px] font-bold">统计</span>
      </button>

      <button 
        onClick={() => setCurrentPage('profile')}
        className={`flex flex-col items-center gap-1 flex-1 ${active === 'profile' ? 'text-[#5ebcf3]' : 'text-slate-300'}`}
      >
        <div className="h-8 flex items-center justify-center">
          <motion.div whileTap={{ scale: 0.9 }}>
            <User size={24} strokeWidth={active === 'profile' ? 2.5 : 2} />
          </motion.div>
        </div>
        <span className="text-[10px] font-bold">我的</span>
      </button>
    </nav>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {currentPage === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full"
          >
            {renderHeader(
              '待办清单',
              <button onClick={() => setCurrentPage('stats')} className="text-white"><BarChart2 size={24} /></button>,
              <button onClick={() => { setEditingTodo(null); setCurrentPage('add'); }} className="text-white"><Plus size={24} /></button>
            )}
            <main className="p-4 space-y-3 flex-1 overflow-y-auto">
              {todos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                  <p>暂无待办，点击右上角添加</p>
                </div>
              ) : (
                todos.map(todo => (
                  <div 
                    key={todo.id}
                    onClick={() => { setSelectedTodoId(todo.id); setCurrentPage('detail'); }}
                    className="rounded-xl py-3 px-5 text-white flex items-center justify-between cursor-pointer macaron-shadow transition-transform active:scale-[0.98]"
                    style={{ backgroundColor: todo.color }}
                  >
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold">{todo.name}</h3>
                      <div className="flex items-center gap-2 opacity-90 text-xs">
                        <span>{todo.category}</span>
                        <span>•</span>
                        <span>正计时</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTodoId(todo.id);
                        setCurrentPage('timer');
                      }}
                      className="text-white font-bold px-4 py-2 text-base"
                    >
                      开始
                    </button>
                  </div>
                ))
              )}
            </main>
            <BottomNav active="list" />
          </motion.div>
        )}

        {(currentPage === 'add' || currentPage === 'edit') && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1 flex flex-col"
          >
            {renderHeader(
              currentPage === 'add' ? '添加待办' : '编辑待办',
              <button onClick={() => setCurrentPage('list')} className="text-white"><ArrowLeft size={24} /></button>
            )}
            <TodoForm 
              initialTodo={currentPage === 'edit' ? selectedTodo : undefined}
              onSave={(data) => {
                if (currentPage === 'edit' && selectedTodo) {
                  handleUpdateTodo({ ...selectedTodo, ...data });
                } else {
                  handleAddTodo(data as any);
                }
              }}
            />
          </motion.div>
        )}

        {currentPage === 'timer' && selectedTodo && (
          <motion.div 
            key="timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col text-white"
            style={{ backgroundColor: selectedTodo.color }}
          >
            <TimerScreen 
              todo={selectedTodo}
              onBack={() => setCurrentPage('list')}
              onSave={(duration) => handleSaveSession(selectedTodo.id, duration)}
            />
          </motion.div>
        )}

        {currentPage === 'detail' && selectedTodo && (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 z-[100] flex flex-col text-white"
            style={{ backgroundColor: selectedTodo.color }}
          >
            <TodoDetailScreen 
              todo={selectedTodo}
              onBack={() => setCurrentPage('list')}
              onEdit={() => setCurrentPage('edit')}
              onArchive={() => handleArchiveTodo(selectedTodo.id)}
              onDelete={() => handleDeleteTodo(selectedTodo.id)}
            />
          </motion.div>
        )}

        {currentPage === 'stats' && (
          <motion.div 
            key="stats"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ backgroundColor: BG_LIGHT_BLUE }}
          >
            <StatsScreen 
              globalStats={globalStats}
              onBack={() => setCurrentPage('list')}
            />
            <BottomNav active="stats" />
          </motion.div>
        )}

        {currentPage === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ backgroundColor: BG_LIGHT_BLUE }}
          >
            <ProfileScreen onBack={() => setCurrentPage('list')} />
            <BottomNav active="profile" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function ProfileScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-16 shadow-sm" style={{ backgroundColor: HEADER_BLUE }}>
        <div className="w-10 flex justify-start">
          <button onClick={onBack} className="text-white"><ArrowLeft size={24} /></button>
        </div>
        <h1 className="text-white text-lg font-bold">我的</h1>
        <div className="w-10 flex justify-end"></div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="flex flex-col items-center py-8 space-y-4">
          <div className="w-24 h-24 rounded-full bg-white border-4 border-white flex items-center justify-center overflow-hidden shadow-md text-[#89d0ec]">
            <User size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">专注用户</h3>
          <p className="text-sm text-slate-500">坚持专注，遇见更好的自己</p>
        </div>

        <div className="bg-white rounded-3xl p-4 space-y-2 text-slate-800 shadow-lg">
          <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
            <span className="font-medium">个人资料</span>
            <ArrowLeft size={16} className="rotate-180 opacity-30" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
            <span className="font-medium">设置</span>
            <ArrowLeft size={16} className="rotate-180 opacity-30" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
            <span className="font-medium">关于我们</span>
            <ArrowLeft size={16} className="rotate-180 opacity-30" />
          </button>
        </div>
      </main>
    </div>
  );
}

function TodoForm({ initialTodo, onSave }: { initialTodo?: Todo, onSave: (data: Partial<Todo>) => void }) {
  const [name, setName] = useState(initialTodo?.name || '');
  const [category, setCategory] = useState(initialTodo?.category || CATEGORIES[0].name);
  const [color, setColor] = useState(initialTodo?.color || CATEGORIES[0].color);

  return (
    <main className="p-6 space-y-10 flex-1 flex flex-col">
      <div className="space-y-6">
        <label className="text-lg font-medium">待办名称</label>
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入待办名称"
          className="w-full h-14 px-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#3897f0] outline-none placeholder:text-slate-300"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">挑选时间类型</h2>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => { setCategory(cat.name); setColor(cat.color); }}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-white font-bold text-sm transition-all relative ${category === cat.name ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
              style={{ backgroundColor: cat.color }}
            >
              {category === cat.name && (
                <motion.div 
                  layoutId="active-cat-border"
                  className="absolute inset-0 border-4 border-white/30 rounded-2xl"
                />
              )}
              {category === cat.name && (
                <motion.div 
                  layoutId="active-cat-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md z-20"
                >
                  <Check size={12} style={{ color: cat.color }} strokeWidth={4} />
                </motion.div>
              )}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
        <span className="font-medium">定制计时器</span>
        <div className="flex items-center gap-2 text-[#89d0ec] font-bold">
          <span>正计时</span>
          <TimerIcon size={20} />
        </div>
      </div>

      <div className="mt-auto pb-8">
        <button 
          onClick={() => onSave({ name, category, color })}
          disabled={!name.trim()}
          className="w-full h-14 bg-[#3897f0] text-white text-lg font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          保存
        </button>
      </div>
    </main>
  );
}

function TimerScreen({ todo, onBack, onSave }: { todo: Todo, onBack: () => void, onSave: (duration: number) => void }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-full">
        <header className="p-6">
          <button onClick={onBack} className="text-white"><ArrowLeft size={32} /></button>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="text-[100px] font-extrabold timer-glow leading-none tabular-nums">
            {formatTime(seconds)}
          </div>
          <h2 className="text-2xl font-bold mt-4 opacity-90">{todo.name}</h2>
        </main>

        <footer className="p-12 flex justify-between items-center max-w-sm mx-auto w-full">
          <button 
            onClick={onBack}
            className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg"
          >
            <X size={28} />
          </button>
          
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-18 h-18 rounded-2xl bg-white text-black flex items-center justify-center shadow-xl"
          >
            {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" />}
          </button>

          <button 
            onClick={() => onSave(seconds)}
            className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg"
          >
            <Check size={28} />
          </button>
        </footer>
      </div>
    </div>
  );
}

function TodoDetailScreen({ todo, onBack, onEdit, onArchive, onDelete }: { 
  todo: Todo, 
  onBack: () => void, 
  onEdit: () => void, 
  onArchive: () => void, 
  onDelete: () => void 
}) {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-16">
        <div className="w-10 flex justify-start">
          <button onClick={onBack} className="text-white"><ArrowLeft size={24} /></button>
        </div>
        <h1 className="text-white text-lg font-bold">{todo.name}</h1>
        <div className="w-10 flex justify-end"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30">
          <h3 className="text-lg font-bold mb-6">累计专注</h3>
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-sm opacity-80">次数</p>
              <p className="text-4xl font-bold">{todo.totalCount}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm opacity-80">时长 (分钟)</p>
              <p className="text-4xl font-bold">{Math.floor(todo.totalDuration / 60)}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 flex gap-3">
        <button 
          onClick={onEdit}
          className="flex-1 h-12 bg-[#89d0ec] text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm"
        >
          <Edit2 size={18} /> 编辑
        </button>
        <button 
          onClick={onArchive}
          className="flex-1 h-12 bg-[#A7E8BD] text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm"
        >
          <Archive size={18} /> 归档
        </button>
        <button 
          onClick={onDelete}
          className="flex-1 h-12 bg-[#FFB3B3] text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm"
        >
          <Trash2 size={18} /> 删除
        </button>
      </footer>
    </div>
  );
}

function StatsScreen({ globalStats, onBack }: { globalStats: GlobalStats, onBack: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const todayStats = globalStats.dailyStats[today] || { count: 0, duration: 0 };
  
  const daysCount = Object.keys(globalStats.dailyStats).length || 1;
  const avgDuration = globalStats.totalDuration / daysCount;

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-16 shadow-sm" style={{ backgroundColor: HEADER_BLUE }}>
        <div className="w-10 flex justify-start">
          <button onClick={onBack} className="text-white"><ArrowLeft size={24} /></button>
        </div>
        <h1 className="text-white text-lg font-bold">待办专注统计</h1>
        <div className="w-10 flex justify-end"></div>
      </header>

      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <section className="bg-white rounded-3xl p-5 space-y-4 text-slate-800 shadow-lg">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">累计专注</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <span className="text-slate-500 text-sm">总次数</span>
              <span className="text-lg font-bold">{globalStats.totalCount}次</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <span className="text-slate-500 text-sm">总时长</span>
              <span className="text-lg font-bold">{formatDuration(globalStats.totalDuration)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">日均时长</span>
              <span className="text-lg font-bold">{formatDuration(avgDuration)}</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-5 space-y-4 text-slate-800 shadow-lg">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">当日专注</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <span className="text-slate-500 text-sm">次数</span>
              <span className="text-lg font-bold">{todayStats.count}次</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">时长</span>
              <span className="text-lg font-bold">{formatDuration(todayStats.duration)}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
