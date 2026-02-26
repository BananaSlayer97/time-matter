/**
 * 中国传统节日日期查询表 (2024-2032)
 * 农历节日无法通过简单公式计算，使用查找表确保准确
 */

interface FestivalDates {
    [year: number]: string; // ISO date string 'YYYY-MM-DD'
}

interface FestivalInfo {
    id: string;
    name: string;
    icon: string;
    dates: FestivalDates;
    description: string;
}

// Pre-computed lunar festival dates (Gregorian equivalents)
export const LUNAR_FESTIVALS: FestivalInfo[] = [
    {
        id: 'spring-festival',
        name: '春节',
        icon: '🧨',
        description: '农历正月初一，万象更新',
        dates: {
            2024: '2024-02-10', 2025: '2025-01-29', 2026: '2026-02-17',
            2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13',
            2030: '2030-02-03', 2031: '2031-01-23', 2032: '2032-02-11',
        },
    },
    {
        id: 'new-year-eve',
        name: '除夕',
        icon: '🏮',
        description: '农历腊月最后一天，阖家团圆',
        dates: {
            2024: '2024-02-09', 2025: '2025-01-28', 2026: '2026-02-16',
            2027: '2027-02-05', 2028: '2028-01-25', 2029: '2029-02-12',
            2030: '2030-02-02', 2031: '2031-01-22', 2032: '2032-02-10',
        },
    },
    {
        id: 'lantern-festival',
        name: '元宵节',
        icon: '🏮',
        description: '农历正月十五，赏灯猜谜',
        dates: {
            2024: '2024-02-24', 2025: '2025-02-12', 2026: '2026-03-03',
            2027: '2027-02-20', 2028: '2028-02-09', 2029: '2029-02-27',
            2030: '2030-02-17', 2031: '2031-02-06', 2032: '2032-02-25',
        },
    },
    {
        id: 'qingming',
        name: '清明节',
        icon: '🌿',
        description: '踏青祭祖，缅怀先人',
        dates: {
            2024: '2024-04-04', 2025: '2025-04-04', 2026: '2026-04-05',
            2027: '2027-04-05', 2028: '2028-04-04', 2029: '2029-04-04',
            2030: '2030-04-05', 2031: '2031-04-05', 2032: '2032-04-04',
        },
    },
    {
        id: 'dragon-boat',
        name: '端午节',
        icon: '🐉',
        description: '农历五月初五，粽叶飘香',
        dates: {
            2024: '2024-06-10', 2025: '2025-05-31', 2026: '2026-06-19',
            2027: '2027-06-08', 2028: '2028-05-28', 2029: '2029-06-16',
            2030: '2030-06-05', 2031: '2031-06-24', 2032: '2032-06-13',
        },
    },
    {
        id: 'qixi',
        name: '七夕节',
        icon: '🌌',
        description: '农历七月初七，中国情人节',
        dates: {
            2024: '2024-08-10', 2025: '2025-08-29', 2026: '2026-08-19',
            2027: '2027-08-08', 2028: '2028-08-26', 2029: '2029-08-16',
            2030: '2030-08-05', 2031: '2031-08-24', 2032: '2032-08-13',
        },
    },
    {
        id: 'mid-autumn',
        name: '中秋节',
        icon: '🥮',
        description: '农历八月十五，明月千里寄相思',
        dates: {
            2024: '2024-09-17', 2025: '2025-10-06', 2026: '2026-09-25',
            2027: '2027-09-15', 2028: '2028-10-03', 2029: '2029-09-22',
            2030: '2030-09-12', 2031: '2031-10-01', 2032: '2032-09-19',
        },
    },
    {
        id: 'double-ninth',
        name: '重阳节',
        icon: '🏔',
        description: '农历九月初九，登高望远',
        dates: {
            2024: '2024-10-11', 2025: '2025-10-29', 2026: '2026-10-18',
            2027: '2027-10-08', 2028: '2028-10-26', 2029: '2029-10-16',
            2030: '2030-10-05', 2031: '2031-10-24', 2032: '2032-10-12',
        },
    },
];

// Solar (fixed) Chinese holidays
export const SOLAR_FESTIVALS: FestivalInfo[] = [
    {
        id: 'new-year',
        name: '元旦',
        icon: '🎆',
        description: '新年第一天，辞旧迎新',
        dates: {}, // Every year Jan 1
    },
    {
        id: 'labor-day',
        name: '劳动节',
        icon: '💪',
        description: '五一国际劳动节',
        dates: {}, // Every year May 1
    },
    {
        id: 'national-day',
        name: '国庆节',
        icon: '🇨🇳',
        description: '中华人民共和国成立纪念日',
        dates: {}, // Every year Oct 1
    },
];

// Fixed solar festival dates
const SOLAR_DATES: Record<string, { month: number; day: number }> = {
    'new-year': { month: 1, day: 1 },
    'labor-day': { month: 5, day: 1 },
    'national-day': { month: 10, day: 1 },
};

/**
 * 获取某个节日的下一个日期（返回 ISO 字符串）
 */
export function getNextFestivalDate(festivalId: string): string | null {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check solar festivals first
    if (SOLAR_DATES[festivalId]) {
        const { month, day } = SOLAR_DATES[festivalId];
        const thisYear = new Date(now.getFullYear(), month - 1, day);
        if (thisYear >= today) {
            return thisYear.toISOString();
        }
        return new Date(now.getFullYear() + 1, month - 1, day).toISOString();
    }

    // Lunar festivals
    const festival = LUNAR_FESTIVALS.find(f => f.id === festivalId);
    if (!festival) return null;

    // Find the next date in the lookup table
    const years = Object.keys(festival.dates).map(Number).sort();
    for (const year of years) {
        const dateStr = festival.dates[year];
        const date = new Date(dateStr + 'T00:00:00');
        if (date >= today) {
            return date.toISOString();
        }
    }

    // If all dates are in the past, return the last known date
    const lastYear = years[years.length - 1];
    return new Date(festival.dates[lastYear] + 'T00:00:00').toISOString();
}

/**
 * 获取所有节日及其下一个日期的列表
 */
export function getAllUpcomingFestivals(): Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    nextDate: string;
    daysUntil: number;
}> {
    const now = Date.now();
    const all = [...LUNAR_FESTIVALS, ...SOLAR_FESTIVALS];

    return all
        .map(f => {
            const nextDate = getNextFestivalDate(f.id);
            if (!nextDate) return null;
            const daysUntil = Math.ceil((new Date(nextDate).getTime() - now) / 86400_000);
            return { id: f.id, name: f.name, icon: f.icon, description: f.description, nextDate, daysUntil };
        })
        .filter(Boolean) as any[];
}
