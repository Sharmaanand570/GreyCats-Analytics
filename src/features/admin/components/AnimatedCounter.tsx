import { useEffect, useState } from "react";

interface AnimatedCounterProps {
    value: number | string;
    duration?: number;
}

export function AnimatedCounter({ value, duration = 1000 }: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);

    // If value is a string (like "₹1000"), extract the number
    const numericValue = typeof value === 'string'
        ? parseFloat(value.replace(/[^0-9.-]+/g, ""))
        : value;

    const prefix = typeof value === 'string'
        ? value.replace(/[0-9.-]+/g, "")
        : "";

    useEffect(() => {
        if (isNaN(numericValue)) {
            return;
        }

        let startTime: number | null = null;
        const startValue = 0;
        const endValue = numericValue;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = startValue + (endValue - startValue) * easeOutQuart;

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [numericValue, duration]);

    if (isNaN(numericValue)) {
        return <span>{value}</span>;
    }

    return (
        <span>
            {prefix}{Math.round(displayValue).toLocaleString()}
        </span>
    );
}
