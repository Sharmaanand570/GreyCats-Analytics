import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    requireTyping?: string; // Optional word user must type to confirm (e.g., "DELETE")
    variant?: 'default' | 'destructive';
    isLoading?: boolean;
}

/**
 * Enhanced confirmation dialog for critical actions
 * Supports "type to confirm" for destructive operations
 */
export const ConfirmDialog = ({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    requireTyping,
    variant = 'default',
    isLoading = false,
}: ConfirmDialogProps) => {
    const [typedText, setTypedText] = useState('');

    const isTypingMatch = !requireTyping || typedText === requireTyping;
    const canConfirm = isTypingMatch && !isLoading;

    const handleConfirm = (e: React.MouseEvent) => {
        e.preventDefault();
        if (canConfirm) {
            onConfirm();
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {requireTyping && (
                    <div className="py-2">
                        <p className="text-sm text-gray-600 mb-2">
                            Type <strong>{requireTyping}</strong> to confirm:
                        </p>
                        <Input
                            type="text"
                            value={typedText}
                            onChange={(e) => setTypedText(e.target.value)}
                            placeholder={requireTyping}
                            className="w-full"
                            autoComplete="off"
                            onPaste={(e) => e.preventDefault()} // Prevent pasting for extra friction
                        />
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
