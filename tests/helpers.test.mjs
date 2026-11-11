import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  calculateLoadingProgress,
  easeOutCubic,
  validateFeedbackForm,
} from '../lib/helpers.mjs';

describe('Unit Tests: Application Helper Functions', () => {
  describe('clamp()', () => {
    it('keeps values within default range [0, 1]', () => {
      assert.equal(clamp(0.5), 0.5);
      assert.equal(clamp(0), 0);
      assert.equal(clamp(1), 1);
    });

    it('clamps values below min to min', () => {
      assert.equal(clamp(-0.5), 0);
      assert.equal(clamp(-100), 0);
    });

    it('clamps values above max to max', () => {
      assert.equal(clamp(1.5), 1);
      assert.equal(clamp(999), 1);
    });

    it('supports custom min and max bounds', () => {
      assert.equal(clamp(5, 10, 20), 10);
      assert.equal(clamp(15, 10, 20), 15);
      assert.equal(clamp(25, 10, 20), 20);
    });
  });

  describe('calculateLoadingProgress()', () => {
    it('returns 100 immediately when both model and assets are ready', () => {
      assert.equal(calculateLoadingProgress(true, true, 50, 40), 100);
      assert.equal(calculateLoadingProgress(true, true, 0, 0), 100);
    });

    it('caps progress at 99 before model and assets are fully ready', () => {
      assert.equal(calculateLoadingProgress(false, true, 100, 100), 99);
      assert.equal(calculateLoadingProgress(true, false, 100, 100), 99);
      assert.equal(calculateLoadingProgress(false, false, 100, 100), 99);
    });

    it('scales 3D progress (25% weight) and takes max with assetProgress', () => {
      // progress=40 -> 40*0.25=10; assetProgress=50 -> max(10, 50) = 50
      assert.equal(calculateLoadingProgress(false, false, 40, 50), 50);
      // progress=80 -> 80*0.25=20; assetProgress=10 -> max(20, 10) = 20
      assert.equal(calculateLoadingProgress(false, false, 80, 10), 20);
    });
  });

  describe('easeOutCubic()', () => {
    it('returns 0 at t=0 and 1 at t=1', () => {
      assert.equal(easeOutCubic(0), 0);
      assert.equal(easeOutCubic(1), 1);
    });

    it('calculates intermediate ease-out curve correctly', () => {
      // t=0.5: 1 - (1 - 0.5)^3 = 1 - 0.125 = 0.875
      assert.equal(easeOutCubic(0.5), 0.875);
    });

    it('clamps input out of range [0, 1]', () => {
      assert.equal(easeOutCubic(-1), 0);
      assert.equal(easeOutCubic(2), 1);
    });
  });

  describe('validateFeedbackForm()', () => {
    it('accepts non-empty name and message', () => {
      assert.equal(validateFeedbackForm('Minh', 'Tò he rất đẹp!'), true);
    });

    it('rejects empty or whitespace-only name or message', () => {
      assert.equal(validateFeedbackForm('', 'Hello'), false);
      assert.equal(validateFeedbackForm('   ', 'Hello'), false);
      assert.equal(validateFeedbackForm('Minh', ''), false);
      assert.equal(validateFeedbackForm('Minh', '   '), false);
      assert.equal(validateFeedbackForm('   ', '   '), false);
    });

    it('rejects non-string inputs safely', () => {
      assert.equal(validateFeedbackForm(null, 'Hello'), false);
      assert.equal(validateFeedbackForm('Minh', undefined), false);
    });
  });
});
