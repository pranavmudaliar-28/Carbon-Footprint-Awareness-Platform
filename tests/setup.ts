import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom doesn't implement matchMedia — count-up and reduced-motion checks need it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Stub requestAnimationFrame so CountUp settles synchronously in tests.
if (!('requestAnimationFrame' in globalThis)) {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(() =>
      cb(performance.now())
    )) as unknown as typeof requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number) =>
    clearTimeout(id)) as unknown as typeof cancelAnimationFrame;
}
