/**
 * Formats a number as a currency string with the Rupee symbol (₹).
 * Uses 'en-IN' locale for proper Indian digit grouping.
 * 
 * @param value - The numeric value to format
 * @returns A formatted currency string
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "—";
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
