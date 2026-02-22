import { LucideIcon, Moon, Sun, Bed, Briefcase, GraduationCap, Utensils, Dumbbell, Gamepad2, Coffee, MoreHorizontal } from 'lucide-react';

export interface Todo {
  id: string;
  name: string;
  category: string;
  color: string;
  totalCount: number;
  totalDuration: number; // in seconds
  wallpaperIndex: number;
}

export interface GlobalStats {
  totalCount: number;
  totalDuration: number; // in seconds
  dailyStats: Record<string, { count: number; duration: number }>; // key: YYYY-MM-DD
}

export const CATEGORIES = [
  { name: '睡觉', color: '#64b5f6', icon: Bed },
  { name: '工作', color: '#ffb381', icon: Briefcase },
  { name: '学习', color: '#fce35a', icon: GraduationCap },
  { name: '吃饭', color: '#7cd7b6', icon: Utensils },
  { name: '运动', color: '#ff8b84', icon: Dumbbell },
  { name: '娱乐', color: '#388e3c', icon: Gamepad2 }, // Darker green
  { name: '休息', color: '#9575cd', icon: Coffee },
  { name: '其他', color: '#9e9e9e', icon: MoreHorizontal }, // Gray
];

export const THEME_BLUE = '#3897f0'; // Primary action color
export const HEADER_BLUE = '#89d0ec'; // Lighter header color
export const ACTIVE_BLUE = '#5ebcf3'; // In-between blue for active states
export const BG_LIGHT_BLUE = '#f0f9ff'; // Very light background for stats/profile
export const ARCHIVE_GREEN = '#A7E8BD';
export const DELETE_RED = '#FFB3B3';

export type Page = 'list' | 'add' | 'edit' | 'timer' | 'detail' | 'stats' | 'profile';
