import './ProgressRing.css';

interface ProgressRingProps {
    percentage: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export function ProgressRing({
    percentage,
    size = 48,
    strokeWidth = 3,
    color = 'var(--accent-gold)',
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
        <svg className="progress-ring" width={size} height={size}>
            {/* Background track */}
            <circle
                className="progress-ring__track"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
            />
            {/* Progress arc */}
            <circle
                className="progress-ring__fill"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                stroke={color}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
            />
            {/* Center text */}
            <text
                x={size / 2}
                y={size / 2}
                className="progress-ring__text"
                dominantBaseline="central"
                textAnchor="middle"
            >
                {Math.round(percentage)}%
            </text>
        </svg>
    );
}
