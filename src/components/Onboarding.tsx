import { useState, useEffect } from 'react';
import './Onboarding.css';

const ONBOARDING_KEY = 'time-matter-onboarded';

const STEPS = [
    {
        icon: '⏳',
        title: '欢迎来到 Time Matter',
        desc: '追踪你关注的重要时刻，每一秒都清晰可见。',
    },
    {
        icon: '🎯',
        title: '创建你的第一个事件',
        desc: '点击右上角「新建」按钮，或按 N 键快速创建倒计时事件。',
    },
    {
        icon: '⚡',
        title: '高效管理',
        desc: '支持搜索、按分类筛选、多种排序，还有键盘快捷键：\n/ 搜索 · N 新建 · Esc 关闭',
    },
];

interface OnboardingProps {
    onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const done = localStorage.getItem(ONBOARDING_KEY);
        if (!done) {
            setVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setVisible(false);
        onComplete();
    };

    if (!visible) return null;

    const current = STEPS[step];

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-card">
                <button className="onboarding-skip" onClick={handleClose}>
                    跳过
                </button>

                <div className="onboarding-icon">{current.icon}</div>
                <h2 className="onboarding-title">{current.title}</h2>
                <p className="onboarding-desc">{current.desc}</p>

                <div className="onboarding-dots">
                    {STEPS.map((_, i) => (
                        <span
                            key={i}
                            className={`onboarding-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                        />
                    ))}
                </div>

                <button className="onboarding-btn" onClick={handleNext}>
                    {step < STEPS.length - 1 ? '下一步' : '开始使用'}
                </button>
            </div>
        </div>
    );
}
