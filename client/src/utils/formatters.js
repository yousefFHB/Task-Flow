import i18n from '../i18n.js';

/**
 * Format a date object or ISO string in the active locale (Persian Solar Hijri for 'fa', Gregorian for 'en')
 */
export function formatDate(dateValue, options = {}) {
  if (!dateValue) return '—';
  try {
    const date = typeof dateValue === 'string' || typeof dateValue === 'number' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return '—';

    const lang = i18n.language || 'en';
    const localeCode = lang === 'fa' ? 'fa-IR' : 'en-US';

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat(localeCode, defaultOptions).format(date);
  } catch {
    return String(dateValue);
  }
}

/**
 * Format a number using the active locale
 */
export function formatNumber(numberValue, options = {}) {
  if (numberValue === undefined || numberValue === null || isNaN(numberValue)) return '0';
  const lang = i18n.language || 'en';
  const localeCode = lang === 'fa' ? 'fa-IR' : 'en-US';
  try {
    return new Intl.NumberFormat(localeCode, options).format(numberValue);
  } catch {
    return String(numberValue);
  }
}

/**
 * Normalizes Persian and Arabic numerals to Latin ASCII (0-9).
 * Used when handling user input in numeric fields (phone numbers, verification codes).
 */
export function normalizePersianDigits(input) {
  if (!input || typeof input !== 'string') return input;
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(persianDigits[i], String(i)).replaceAll(arabicDigits[i], String(i));
  }
  return result;
}

/**
 * Format minutes into friendly hours and minutes (e.g. 1h 30m, 45m)
 */
export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '0m';
  const lang = i18n.language || 'en';
  const isFa = lang === 'fa';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (isFa) {
    if (h > 0 && m > 0) return `${formatNumber(h)} ساعت و ${formatNumber(m)} دقیقه`;
    if (h > 0) return `${formatNumber(h)} ساعت`;
    return `${formatNumber(m)} دقیقه`;
  }
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export default {
  formatDate,
  formatNumber,
  normalizePersianDigits,
  formatDuration,
};
