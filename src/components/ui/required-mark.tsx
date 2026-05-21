/**
 * RequiredMark — a tiny red asterisk that visually signals a required field.
 *
 * Usage:
 *   <label>Campaign Name <RequiredMark /></label>
 *
 * The `aria-hidden` prevents screen readers from reading "asterisk"; the
 * `<span>` wrapping the asterisk carries a visually-hidden accessible label
 * via `title` so AT can optionally surface it on hover/focus.
 */
export function RequiredMark() {
  return (
    <span
      aria-hidden="true"
      title="Required"
      className="ml-0.5 text-rose-500 font-bold leading-none select-none"
    >
      *
    </span>
  );
}
