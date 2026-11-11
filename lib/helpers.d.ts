export declare function clamp(value: number, min?: number, max?: number): number;
export declare function calculateLoadingProgress(
  modelReady: boolean,
  assetsReady: boolean,
  progress: number,
  assetProgress: number
): number;
export declare function easeOutCubic(t: number): number;
export declare function validateFeedbackForm(name: unknown, message: unknown): boolean;
