import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(cleanup);

// Browser capabilities used by the landing page; interaction tests override these.
if (!window.matchMedia)
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }),
  });
if (!globalThis.IntersectionObserver)
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
if (!globalThis.ResizeObserver)
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
