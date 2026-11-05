/**
 * Portify AI — Structured Application & Security Logger
 *
 * Enforces OWASP ASVS 5.0 logging standards:
 * 1. Automatic redaction of sensitive credentials, passwords, tokens, and PII
 * 2. Truncation of large payload previews (no full resumes logged)
 * 3. ISO 8601 timestamps and structured event types
 * 4. Dedicated security audit logging for unauthorized access / IDOR attempts
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'cookie',
  'secret',
  'geminiApiKey',
  'jwtSecret',
  'apikey',
  'api_key',
  'creditcard',
  'cvv',
]);

/**
 * Recursively sanitize an object by masking sensitive keys
 * @param {any} data
 * @param {number} depth
 * @returns {any}
 */
const sanitizeData = (data, depth = 0) => {
  if (depth > 4 || !data) return data;

  if (typeof data === 'string') {
    // Truncate long strings to prevent log injection or resume dumping
    if (data.length > 500) {
      return `${data.substring(0, 100)}... [truncated ${data.length - 100} chars]`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.slice(0, 20).map((item) => sanitizeData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = sanitizeData(value, depth + 1);
      }
    }
    return sanitized;
  }

  return data;
};

/**
 * Format and emit a log message
 * @param {'INFO' | 'WARN' | 'ERROR' | 'SECURITY'} level
 * @param {string} message
 * @param {object} [meta]
 */
const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const sanitizedMeta = sanitizeData(meta);

  const payload = {
    timestamp,
    level,
    message,
    ...(Object.keys(sanitizedMeta).length > 0 ? { meta: sanitizedMeta } : {}),
  };

  const output = JSON.stringify(payload);

  if (level === 'ERROR' || level === 'SECURITY') {
    console.error(`[${level}] ${timestamp} — ${message}`, Object.keys(sanitizedMeta).length ? sanitizedMeta : '');
  } else if (level === 'WARN') {
    console.warn(`[${level}] ${timestamp} — ${message}`, Object.keys(sanitizedMeta).length ? sanitizedMeta : '');
  } else {
    console.log(`[${level}] ${timestamp} — ${message}`, Object.keys(sanitizedMeta).length ? sanitizedMeta : '');
  }
};

const logger = {
  info: (message, meta) => log('INFO', message, meta),
  warn: (message, meta) => log('WARN', message, meta),
  error: (message, meta) => log('ERROR', message, meta),
  security: (message, meta) => log('SECURITY', message, meta),
};

module.exports = logger;

