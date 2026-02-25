import { useEffect, useRef, useState } from 'react';
import './TimeDigit.css';

interface TimeDigitProps {
    value: number;
    label: string;
    isPast: boolean;
}

export function TimeDigit({ value, label, isPast }: TimeDigitProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const [isFlipping, setIsFlipping] = useState(false);
    const prevValueRef = useRef(value);

    useEffect(() => {
        if (prevValueRef.current !== value) {
            setIsFlipping(true);
            const timer = setTimeout(() => {
                setDisplayValue(value);
                setIsFlipping(false);
            }, 150);
            prevValueRef.current = value;
            return () => clearTimeout(timer);
        }
    }, [value]);

    const formatted = String(displayValue).padStart(2, '0');
    const digits = formatted.split('');

    // For days > 99, show all digits
    const dayFormatted = displayValue > 99 ? String(displayValue) : formatted;
    const dayDigits = dayFormatted.split('');

    const digitArray = label === '天' ? dayDigits : digits;

    return (
        <div className="time-digit-container">
            <div className={`time-digit-wrapper ${isFlipping ? 'flipping' : ''} ${isPast ? 'past' : 'future'}`}>
                {digitArray.map((digit, i) => (
                    <span key={`${i}-${digit}`} className="time-digit-char">
                        {digit}
                    </span>
                ))}
            </div>
            <span className="time-digit-label">{label}</span>
        </div>
    );
}
