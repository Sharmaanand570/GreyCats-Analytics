import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RevealSecretProps {
    value: string;
    masked: string;
    label?: string;
    className?: string;
}

/**
 * Component to securely reveal sensitive information
 * defaults to masked view, requires user interaction to reveal
 */
export const RevealSecret = ({ value, masked, label, className = '' }: RevealSecretProps) => {
    const [revealed, setRevealed] = useState(false);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {label && <span className="text-sm font-medium text-gray-500 mr-1">{label}:</span>}
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono select-all">
                {revealed ? value : masked}
            </code>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setRevealed(!revealed)}
                title={revealed ? "Hide" : "Reveal"}
            >
                {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{revealed ? "Hide" : "Reveal"}</span>
            </Button>
        </div>
    );
};
