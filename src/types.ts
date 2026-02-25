export interface TimeEvent {
  id: string;
  name: string;
  targetDate: string; // ISO string
  category: EventCategory;
  color: string;
  createdAt: string; // ISO string
  order: number;
}

export type EventCategory = 
  | 'birthday'
  | 'anniversary'
  | 'goal'
  | 'work'
  | 'travel'
  | 'custom';

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

export const CATEGORIES: Record<EventCategory, CategoryInfo> = {
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
