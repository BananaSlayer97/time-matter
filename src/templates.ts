// Event template data

export interface EventTemplate {
    name: string;
    category: string;
    color: string;
    icon: string;
    /** 'past' = 用户填一个过去的日期(回溯), 'future' = 填未来日期(展望), 'recurring' = 每年循环 */
    dateHint: 'past' | 'future' | 'recurring';
    datePlaceholder: string;
    recurring?: 'yearly' | 'none';
    note?: string;
}

export interface TemplatePack {
    id: string;
    name: string;
    icon: string;
    description: string;
    gradient: string;
    templates: EventTemplate[];
}

export const TEMPLATE_PACKS: TemplatePack[] = [
    {
        id: 'milestone',
        name: '人生里程碑',
        icon: '🏔',
        description: '记录生命中最重要的时刻',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        templates: [
            {
                name: '我的生日',
                category: 'birthday',
                color: '#f093fb',
                icon: '🎂',
                dateHint: 'past',
                datePlaceholder: '选择你的出生日期',
                recurring: 'yearly',
                note: '记录我来到这个世界的日子',
            },
            {
                name: '毕业日',
                category: 'anniversary',
                color: '#4facfe',
                icon: '🎓',
                dateHint: 'past',
                datePlaceholder: '选择毕业日期',
                note: '离开校园，踏入社会',
            },
            {
                name: '入职纪念日',
                category: 'work',
                color: '#fa709a',
                icon: '💼',
                dateHint: 'past',
                datePlaceholder: '选择第一天上班的日期',
                recurring: 'yearly',
                note: '职业旅程的起点',
            },
            {
                name: '来到这座城市',
                category: 'travel',
                color: '#a18cd1',
                icon: '🏙',
                dateHint: 'past',
                datePlaceholder: '选择到达日期',
                note: '在这里开始新生活的日子',
            },
            {
                name: '退休倒计时',
                category: 'goal',
                color: '#43e97b',
                icon: '🏖',
                dateHint: 'future',
                datePlaceholder: '选择预计退休日期',
                note: '自由的日子终将到来',
            },
        ],
    },
    {
        id: 'family',
        name: '家庭关怀',
        icon: '👨‍👩‍👧',
        description: '不要忘记最重要的人',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        templates: [
            {
                name: '爸爸生日',
                category: 'birthday',
                color: '#f5576c',
                icon: '👨',
                dateHint: 'recurring',
                datePlaceholder: '选择爸爸的生日',
                recurring: 'yearly',
            },
            {
                name: '妈妈生日',
                category: 'birthday',
                color: '#f093fb',
                icon: '👩',
                dateHint: 'recurring',
                datePlaceholder: '选择妈妈的生日',
                recurring: 'yearly',
            },
            {
                name: '结婚纪念日',
                category: 'anniversary',
                color: '#ff6b6b',
                icon: '💍',
                dateHint: 'recurring',
                datePlaceholder: '选择结婚日期',
                recurring: 'yearly',
                note: '最浪漫的日子',
            },
            {
                name: '在一起纪念日',
                category: 'anniversary',
                color: '#ee5a6f',
                icon: '❤️',
                dateHint: 'past',
                datePlaceholder: '选择在一起的日期',
                recurring: 'yearly',
                note: '从那天起，一切都不一样了',
            },
        ],
    },
    {
        id: 'utility',
        name: '实用提醒',
        icon: '📋',
        description: '别错过重要的截止日期',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        templates: [
            {
                name: '驾照到期',
                category: 'work',
                color: '#fee140',
                icon: '🚗',
                dateHint: 'future',
                datePlaceholder: '选择驾照到期日',
                note: '记得提前 90 天续期',
            },
            {
                name: '护照到期',
                category: 'travel',
                color: '#a18cd1',
                icon: '📘',
                dateHint: 'future',
                datePlaceholder: '选择护照到期日',
                note: '提前 6 个月办理',
            },
            {
                name: '年度体检',
                category: 'custom',
                color: '#43e97b',
                icon: '🏥',
                dateHint: 'future',
                datePlaceholder: '选择下次体检日期',
                recurring: 'yearly',
                note: '健康是最大的财富',
            },
            {
                name: '贷款还清日',
                category: 'goal',
                color: '#38f9d7',
                icon: '🏦',
                dateHint: 'future',
                datePlaceholder: '选择最后还款日',
                note: '自由的曙光就在前方',
            },
            {
                name: '保险到期',
                category: 'work',
                color: '#fa709a',
                icon: '🛡',
                dateHint: 'future',
                datePlaceholder: '选择保险到期日',
            },
        ],
    },
    {
        id: 'growth',
        name: '成长打卡',
        icon: '🌱',
        description: '记录每一天的进步',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        templates: [
            {
                name: '开始健身',
                category: 'goal',
                color: '#43e97b',
                icon: '💪',
                dateHint: 'past',
                datePlaceholder: '选择开始日期',
                note: '坚持就是胜利',
            },
            {
                name: '开始读书计划',
                category: 'goal',
                color: '#4facfe',
                icon: '📚',
                dateHint: 'past',
                datePlaceholder: '选择开始日期',
                note: '每天进步一点点',
            },
            {
                name: '戒掉坏习惯',
                category: 'goal',
                color: '#f093fb',
                icon: '🚫',
                dateHint: 'past',
                datePlaceholder: '选择开始日期',
                note: '今天是新的开始',
            },
            {
                name: '学习新技能',
                category: 'goal',
                color: '#667eea',
                icon: '🧠',
                dateHint: 'past',
                datePlaceholder: '选择开始日期',
                note: '持续学习，永不止步',
            },
            {
                name: '考试倒计时',
                category: 'goal',
                color: '#ff6b6b',
                icon: '📝',
                dateHint: 'future',
                datePlaceholder: '选择考试日期',
                note: '全力以赴，金榜题名',
            },
        ],
    },
];
