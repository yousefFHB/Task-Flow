import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SUPPORTED_LOCALES = ["en", "fa"];
export const DEFAULT_LOCALE = "en";

// Load translation dictionaries
const localesDir = path.resolve(__dirname, "../locales");
const translations = {
  en: JSON.parse(fs.readFileSync(path.join(localesDir, "en.json"), "utf8")),
  fa: JSON.parse(fs.readFileSync(path.join(localesDir, "fa.json"), "utf8")),
};

/**
 * Deep key lookup: e.g. "auth.invalidCredentials"
 */
function getNestedValue(obj, keyPath) {
  if (!obj || !keyPath) return null;
  const keys = keyPath.split(".");
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      return null;
    }
  }
  return typeof current === "string" ? current : null;
}

/**
 * Replace {{variable}} with params[variable]
 */
function interpolate(template, params = {}) {
  if (!template) return "";
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, match) => {
    return params[match] !== undefined ? String(params[match]) : "";
  });
}

/**
 * Pure translation function (request-safe, no global mutation)
 */
export function translate(key, locale = DEFAULT_LOCALE, params = {}) {
  const targetLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  
  // Try target locale first
  let message = getNestedValue(translations[targetLocale], key);
  
  // Fallback to default locale (en) if missing
  if (!message && targetLocale !== DEFAULT_LOCALE) {
    message = getNestedValue(translations[DEFAULT_LOCALE], key);
  }

  // If still missing, return the key itself
  if (!message) {
    return key;
  }

  return interpolate(message, params);
}

/**
 * Request locale resolver (Accept-Language, x-locale header, query, user preference)
 */
export function resolveLocale(req) {
  // 1. Explicit header: x-locale
  const headerLocale = req.headers["x-locale"] || req.headers["x-lang"];
  if (headerLocale) {
    const cleaned = String(headerLocale).trim().toLowerCase().slice(0, 2);
    if (SUPPORTED_LOCALES.includes(cleaned)) {
      return cleaned;
    }
  }

  // 2. Query param: ?locale=fa or ?lang=fa
  const queryLocale = req.query?.locale || req.query?.lang;
  if (queryLocale) {
    const cleaned = String(queryLocale).trim().toLowerCase().slice(0, 2);
    if (SUPPORTED_LOCALES.includes(cleaned)) {
      return cleaned;
    }
  }

  // 3. User saved preference (if auth middleware set req.user)
  if (req.user?.preferredLocale && SUPPORTED_LOCALES.includes(req.user.preferredLocale)) {
    return req.user.preferredLocale;
  }

  // 4. Accept-Language header (e.g. "fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7")
  const acceptLang = req.headers["accept-language"];
  if (acceptLang) {
    const parts = acceptLang.split(",").map((p) => p.trim().split(";")[0].toLowerCase());
    for (const part of parts) {
      const code = part.slice(0, 2);
      if (SUPPORTED_LOCALES.includes(code)) {
        return code;
      }
    }
  }

  // 5. Default fallback
  return DEFAULT_LOCALE;
}

/**
 * Express middleware for request-scoped i18n
 */
export function i18nMiddleware(req, res, next) {
  const locale = resolveLocale(req);
  req.locale = locale;

  // Set response Content-Language header
  res.setHeader("Content-Language", locale);

  // Request-scoped translation helper
  req.t = (key, params) => translate(key, req.locale, params);

  /**
   * Standardized API response helper
   */
  res.sendLocalized = ({
    status = 200,
    success = true,
    code = null,
    messageKey = null,
    defaultMessage = null,
    params = {},
    data = null,
    pagination = null,
    errors = null,
  }) => {
    let message = defaultMessage;
    if (messageKey) {
      message = req.t(messageKey, params);
    }

    const payload = {
      success,
      message: message || (success ? "Success" : "Error"),
    };

    if (code || !success) {
      payload.error = {
        code: code || (success ? "SUCCESS" : "ERROR"),
        message: payload.message,
      };
    }

    if (data !== null && data !== undefined) payload.data = data;
    if (pagination) payload.pagination = pagination;
    if (errors) payload.errors = errors;

    return res.status(status).json(payload);
  };

  next();
}
