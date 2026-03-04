declare module 'react-gridlines';

// Razorpay global (loaded via dynamic script tag)
declare class Razorpay {
  constructor(options: Record<string, unknown>);
  open(): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
}

interface Window {
  Razorpay: typeof Razorpay;
}

















































