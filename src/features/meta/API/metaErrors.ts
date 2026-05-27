import type { AxiosError } from "axios";

// ==================== TYPES ====================

// The structured error envelope backend returns from every Meta-related route.
// Code prefixes:
//   META_*         — error from Meta Marketing API (e.g. META_100)
//   VALIDATION_*   — our server-side validators (e.g. VALIDATION_SPECIAL_AD_CATEGORY)
//   AUTH_*         — auth / role / permission (e.g. AUTH_INSUFFICIENT_ROLE)
//   IDEMPOTENCY_*  — idempotency-key conflict (e.g. IDEMPOTENCY_CONFLICT)
//   JOB_*          — async publish-job lifecycle (e.g. JOB_NOT_FOUND, JOB_EXPIRED)
//   UPGRADE_*      — plan/billing gate (shares the existing upgradeRequired flow)
export type MetaErrorEnvelope = {
  success: false;
  code: string;
  message: string;
  field?: string;
  fbtrace_id?: string;
  rawError?: unknown;
  // Legacy compat: some older routes only returned `error` or `message` and
  // no `code`. The parser falls back to those before declaring `UNKNOWN`.
  error?: string;
};

export type MetaErrorPrefix =
  | "META"
  | "VALIDATION"
  | "AUTH"
  | "IDEMPOTENCY"
  | "JOB"
  | "UPGRADE"
  | "UNKNOWN";

// Normalized form the rest of the app consumes. `raw` is preserved for
// debugging dashboards but should never be rendered to end users.
export type ParsedMetaError = {
  prefix: MetaErrorPrefix;
  code: string;
  message: string;
  field?: string;
  fbtrace_id?: string;
  // HTTP status from the response — useful for branching on 4xx vs 5xx.
  status?: number;
  raw?: unknown;
};

// ==================== PARSING ====================

const PREFIXES: MetaErrorPrefix[] = [
  "META",
  "VALIDATION",
  "AUTH",
  "IDEMPOTENCY",
  "JOB",
  "UPGRADE",
];

const prefixOf = (code: string | undefined): MetaErrorPrefix => {
  if (!code) return "UNKNOWN";
  const head = code.split("_")[0]?.toUpperCase();
  return (PREFIXES as readonly string[]).includes(head ?? "")
    ? (head as MetaErrorPrefix)
    : "UNKNOWN";
};

/**
 * Parse any error thrown from an axios-based Meta API call into the
 * normalized shape. Handles three input forms:
 *   1. AxiosError carrying a backend envelope in `response.data`
 *   2. A plain Error thrown by our API wrappers (which usually re-throw
 *      `new Error(backendMsg)` — message survives, code does not)
 *   3. The envelope object directly (e.g. parsed JSON from a 200 + success:false)
 */
export const parseMetaError = (input: unknown): ParsedMetaError => {
  // (3) direct envelope
  if (isEnvelope(input)) {
    return envelopeToParsed(input);
  }

  // (1) axios error
  if (isAxiosError(input)) {
    const status = input.response?.status;
    const data = input.response?.data as Partial<MetaErrorEnvelope> | undefined;
    if (data && (data.code || data.message || data.error)) {
      return {
        ...envelopeToParsed(data as MetaErrorEnvelope),
        status,
      };
    }
    return {
      prefix: "UNKNOWN",
      code: status ? `HTTP_${status}` : "NETWORK_ERROR",
      message: input.message || "Request failed",
      status,
      raw: input,
    };
  }

  // (2) generic Error — code prefix is lost, only the message survives.
  // We still bucket by prefix in case the backend embedded it in the message.
  if (input instanceof Error) {
    const code = extractCodeFromMessage(input.message);
    return {
      prefix: prefixOf(code),
      code: code ?? "UNKNOWN",
      message: input.message,
      raw: input,
    };
  }

  return {
    prefix: "UNKNOWN",
    code: "UNKNOWN",
    message: "An unexpected error occurred",
    raw: input,
  };
};

const envelopeToParsed = (e: Partial<MetaErrorEnvelope>): ParsedMetaError => {
  const code = e.code ?? "UNKNOWN";
  return {
    prefix: prefixOf(code),
    code,
    message: e.message ?? e.error ?? "Request failed",
    field: e.field,
    fbtrace_id: e.fbtrace_id,
    raw: e.rawError ?? e,
  };
};

const isAxiosError = (x: unknown): x is AxiosError =>
  !!x &&
  typeof x === "object" &&
  (x as { isAxiosError?: unknown }).isAxiosError === true;

const isEnvelope = (x: unknown): x is MetaErrorEnvelope =>
  !!x &&
  typeof x === "object" &&
  (x as { success?: unknown }).success === false &&
  typeof (x as { message?: unknown }).message === "string";

// Some backend wrappers re-throw `new Error("META_100: Invalid parameter…")`.
// Recover the code so toasts/banners can still branch on prefix.
const extractCodeFromMessage = (msg: string): string | undefined => {
  const match = msg.match(/^(META|VALIDATION|AUTH|IDEMPOTENCY|JOB|UPGRADE)_[A-Z0-9_]+/);
  return match?.[0];
};

// ==================== USER-FACING FORMATTING ====================

/**
 * Toast/banner text. Keep PII and Meta internal IDs out of the user-visible
 * string; surface them only via the support trailer.
 */
export const formatUserMessage = (e: ParsedMetaError): string => {
  switch (e.prefix) {
    case "VALIDATION":
      // The backend's `message` is already user-safe and field-specific.
      return e.message;
    case "AUTH":
      return e.message || "You don't have permission to do that.";
    case "IDEMPOTENCY":
      // Silent dedup — same key + same payload is a no-op. Only surface the
      // conflict variant (`IDEMPOTENCY_CONFLICT`) since it indicates a real bug.
      return e.code === "IDEMPOTENCY_CONFLICT"
        ? "This request was already submitted with different details. Please refresh and try again."
        : e.message;
    case "JOB":
      return e.code === "JOB_EXPIRED"
        ? "This publish job has expired. Please resubmit the campaign."
        : e.message;
    case "META":
      // Meta's messages are usually user-readable. Append fbtrace_id for support.
      return e.fbtrace_id
        ? `${e.message} (Reference: ${e.fbtrace_id})`
        : e.message;
    case "UPGRADE":
      return e.message || "Your plan doesn't include this feature.";
    default:
      return e.message || "Something went wrong. Please try again.";
  }
};

/**
 * True when the error should be shown as a toast. IDEMPOTENCY (non-conflict)
 * is a silent dedup — the caller already has the cached result, no need to
 * tell the user anything.
 */
export const shouldToast = (e: ParsedMetaError): boolean => {
  if (e.prefix === "IDEMPOTENCY" && e.code !== "IDEMPOTENCY_CONFLICT") {
    return false;
  }
  return true;
};

/**
 * Field-level errors (`VALIDATION_*` with `field`) should render inline next
 * to the offending input, not as a toast. This selector tells the caller.
 */
export const isFieldError = (e: ParsedMetaError): boolean =>
  e.prefix === "VALIDATION" && !!e.field;
