/**
 * Clamps a numeric value within [min, max] range.
 */
export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Calculates display loading progress percentage.
 */
export function calculateLoadingProgress(modelReady, assetsReady, progress, assetProgress) {
  const loadingComplete = Boolean(modelReady && assetsReady);
  if (loadingComplete) return 100;
  return Math.min(99, Math.max(Math.round(progress * 0.25), assetProgress));
}

/**
 * Ease-out cubic formula used for animated progress.
 */
export function easeOutCubic(t) {
  const clamped = clamp(t, 0, 1);
  return 1 - Math.pow(1 - clamped, 3);
}

/**
 * Validates feedback form input before submission.
 */
export function validateFeedbackForm(name, message) {
  const validName = typeof name === 'string' && name.trim().length > 0;
  const validMessage = typeof message === 'string' && message.trim().length > 0;
  return validName && validMessage;
}
