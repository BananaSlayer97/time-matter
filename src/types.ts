export interface TimeEvent {
  id: string;
  name: string;
  targetDate: string; // ISO string
  category: string; // now a string key (supports custom categories)
  color: string;
  createdAt: string; // ISO string
  order: number;
  recurring?: 'none' | 'yearly'; // recurring mode
  note?: string; // optional note
  pinned?: boolean; // pinned to top
  archived?: boolean; // archived (hidden from main view)
  reminderMinutes?: number; // custom reminder: minutes before event
}

// Built-in category keys
export type BuiltinCategory =
  | 'birthday'
  | 'anniversary'
  | 'goal'
  | 'work'
  | 'travel'
  | 'custom';

// EventCategory is now a string to support custom categories
export type EventCategory = string;

export interface TimeDiff {
  isPast: boolean;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  percentage?: number; // for progress ring
}

export interface CategoryInfo {
  label: string;
  icon: string;
  gradient: string;
}

export const BUILTIN_CATEGORIES: Record<BuiltinCategory, CategoryInfo> = {
  birthday: {
    label: '生日',
    icon: '🎂',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  anniversary: {
    label: '纪念日',
    icon: '💫',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  goal: {
    label: '目标',
    icon: '🎯',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  work: {
    label: '工作',
    icon: '💼',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  travel: {
    label: '旅行',
    icon: '✈️',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
  custom: {
    label: '自定义',
    icon: '⭐',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  },
};

// Backwards-compatible alias (widened to string keys for custom category lookups)
export const CATEGORIES: Record<string, CategoryInfo> = BUILTIN_CATEGORIES;

// Reminder presets (in minutes)
export const REMINDER_PRESETS = [
  { label: '不提醒', value: 0 },
  { label: '10 分钟前', value: 10 },
  { label: '30 分钟前', value: 30 },
  { label: '1 小时前', value: 60 },
  { label: '3 小时前', value: 180 },
  { label: '1 天前', value: 1440 },
  { label: '3 天前', value: 4320 },
  { label: '1 周前', value: 10080 },
];
