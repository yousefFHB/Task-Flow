import i18n from '../i18n.js';

/**
 * Resolves a localized error message from an API error response.
 * Follows the project precedence:
 * 1. Stable error code mapped to frontend translation (guarantees active language match)
 * 2. Backend localized error message
 * 3. Status-based fallback
 * 4. General network or unknown fallback
 */
export function getApiErrorMessage(error, defaultFallbackKey = 'apiErrors.UNKNOWN_ERROR') {
  if (!error) return null;

  // Network connection failure
  if (error.status === 'FETCH_ERROR' || error.message === 'Network Error' || error.name === 'NetworkError') {
    return i18n.t('common.networkError');
  }

  // Extract structured error data if available
  const data = error.data || error.response?.data;
  const errorCode = data?.error?.code || data?.code;

  if (errorCode) {
    const translationKey = `apiErrors.${errorCode}`;
    if (i18n.exists(translationKey)) {
      return i18n.t(translationKey);
    }
  }

  // Backend provided message
  const serverMsg = data?.error?.message || data?.message;
  if (serverMsg && typeof serverMsg === 'string') {
    return serverMsg;
  }

  // Status code fallbacks
  const status = error.status || error.response?.status;
  if (status === 401) {
    return i18n.t('apiErrors.AUTH_UNAUTHORIZED');
  }
  if (status === 404) {
    return i18n.t('apiErrors.NOT_FOUND');
  }
  if (status >= 500) {
    return i18n.t('apiErrors.INTERNAL_SERVER_ERROR');
  }

  return i18n.t(defaultFallbackKey);
}

/**
 * Normalizes field-level validation errors into a key-value map
 */
export function getFieldValidationErrors(error) {
  const data = error?.data || error?.response?.data;
  const fieldErrors = {};

  if (Array.isArray(data?.errors)) {
    for (const item of data.errors) {
      if (item.path && item.message) {
        fieldErrors[item.path] = item.message;
      }
    }
  }

  return fieldErrors;
}
