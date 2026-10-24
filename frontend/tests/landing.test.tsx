import { StrictMode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  within,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage from "../src/features/landing/LandingPage";
import {
  nextCompact,
  workflowStage,
} from "../src/features/landing/useLandingScroll";

let frames: Map<number, FrameRequestCallback>,
  nextFrame: number,
  reduced: boolean;
let mediaListeners: Set<() => void>;
let visibilityCallbacks: IntersectionObserverCallback[];
let disconnects: ReturnType<typeof vi.fn>[];
function rect(top: number, height: number, width = 440) {
  return {
    top,
    bottom: top + height,
    left: 200,
    right: 200 + width,
    width,
    height,
    x: 200,
    y: top,
    toJSON() {},
  } as DOMRect;
}
function frame(time: number) {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(time));
  });
}
function scroll(y: number, time = 0) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
  fireEvent.scroll(window);
  frame(time);
}
function mount(strict = false) {
  const content = (
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  return render(strict ? <StrictMode>{content}</StrictMode> : content);
}
function observeHero(visible: boolean) {
  act(() =>
    visibilityCallbacks.forEach((callback) =>
      callback(
        [{ isIntersecting: visible }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      ),
    ),
  );
}
function heroControls() {
  return screen.getByRole("group", { name: "Product walkthrough stages" });
}
function storyControls() {
  return screen.getByRole("group", { name: "Explore workflow" });
}
beforeEach(() => {
  frames = new Map();
  nextFrame = 1;
  reduced = false;
  mediaListeners = new Set();
  visibilityCallbacks = [];
  disconnects = [];
  localStorage.clear();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = nextFrame++;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1440,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 900,
  });
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduced,
        media: query,
        addEventListener: (_event: string, fn: () => void) =>
          mediaListeners.add(fn),
        removeEventListener: (_event: string, fn: () => void) =>
          mediaListeners.delete(fn),
      }) as MediaQueryList,
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect = vi.fn();
      constructor(
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) {
        if (options?.threshold === 0.2) visibilityCallbacks.push(callback);
        disconnects.push(this.disconnect);
      }
      observe() {}
      unobserve() {}
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      disconnect = vi.fn();
      constructor() {
        disconnects.push(this.disconnect);
      }
      observe() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      if (this.classList.contains("nav-area")) return rect(0, 96);
      if (this.classList.contains("format-strip"))
        return rect(800 - window.scrollY, 60);
      if (this.classList.contains("story-step")) {
        const index = [...this.parentElement!.children].indexOf(this);
        return rect(1200 + index * 400 - window.scrollY, 400);
      }
      return rect(0, 40);
    },
  );
});
afterEach(() => {
  cleanup();
  delete (HTMLElement.prototype as unknown as { animate?: unknown }).animate;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("landing navigation and workflow", () => {
  it("uses hysteresis at 72px and 16px", () => {
    expect(nextCompact(false, 72)).toBe(false);
    expect(nextCompact(false, 73)).toBe(true);
    expect(nextCompact(true, 17)).toBe(true);
    expect(nextCompact(true, 16)).toBe(false);
  });
  it("keeps compactness independent of CTA visibility and removes hidden links from focus", () => {
    const { container } = mount();
    const action = container.querySelector(".nav-cta")!;
    expect(action).toHaveAttribute("tabindex", "-1");
    expect(action).toHaveAttribute("aria-hidden", "true");
    scroll(100);
    expect(container.querySelector(".nav-area")).toHaveClass("compact");
    expect(action).toHaveAttribute("aria-hidden", "true");
    scroll(800);
    expect(action).toHaveAttribute("aria-hidden", "false");
    expect(action).toHaveAttribute("tabindex", "0");
    scroll(50);
    expect(container.querySelector(".nav-area")).toHaveClass("compact");
    expect(action).toHaveAttribute("tabindex", "-1");
    scroll(0);
    expect(container.querySelector(".nav-area")).not.toHaveClass("compact");
  });
  it.each([false, true])(
    "routes actions to the real application (signed in: %s)",
    (signedIn) => {
      if (signedIn) localStorage.setItem("dataspace_user_id", "test-user");
      mount();
      screen
        .getAllByRole("link", { name: "Get Started", hidden: true })
        .forEach((link) =>
          expect(link).toHaveAttribute(
            "href",
            signedIn ? "/dashboard" : "/signup",
          ),
        );
      expect(screen.queryByText(".sqlite3")).not.toBeInTheDocument();
    },
  );
  it("derives workflow stages from all positions in both directions", () => {
    expect(workflowStage([100, 500, 900], 480)).toBe(0);
    expect(workflowStage([-300, 100, 500], 480)).toBe(1);
    expect(workflowStage([-700, -300, 100], 480)).toBe(2);
    mount();
    scroll(1400);
    expect(
      within(storyControls()).getByRole("button", { name: "Schema" }),
    ).toHaveAttribute("aria-pressed", "true");
    scroll(1900);
    expect(
      within(storyControls()).getByRole("button", { name: "Initial insight" }),
    ).toHaveAttribute("aria-pressed", "true");
    scroll(3000);
    expect(
      within(storyControls()).getByRole("button", { name: "Initial insight" }),
    ).toHaveAttribute("aria-pressed", "true");
    scroll(1400);
    expect(
      within(storyControls()).getByRole("button", { name: "Schema" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("preserves manual workflow selection until actual scrolling resumes", () => {
    mount();
    scroll(1400);
    fireEvent.click(
      within(storyControls()).getByRole("button", { name: "Upload" }),
    );
    fireEvent.resize(window);
    frame(1);
    expect(
      within(storyControls()).getByRole("button", { name: "Upload" }),
    ).toHaveAttribute("aria-pressed", "true");
    scroll(1401);
    expect(
      within(storyControls()).getByRole("button", { name: "Schema" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("handles restored scroll position and mobile resize", () => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 1400,
    });
    const { container } = mount();
    expect(container.querySelector(".nav-area")).toHaveClass("compact");
    expect(
      within(storyControls()).getByRole("button", { name: "Schema" }),
    ).toHaveAttribute("aria-pressed", "true");
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    fireEvent.resize(window);
    frame(0);
    scroll(1900);
    expect(
      within(storyControls()).getByRole("button", { name: "Schema" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(
      within(storyControls()).getByRole("button", { name: "Initial insight" }),
    );
    expect(
      within(storyControls()).getByRole("button", { name: "Initial insight" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

describe("hero playback and lifecycle", () => {
  it("plays through three stages once and exposes replay", () => {
    mount();
    observeHero(true);
    frame(0);
    frame(5001);
    expect(
      within(heroControls()).getByRole("button", { name: "Inspect" }),
    ).toHaveAttribute("aria-pressed", "true");
    frame(5002);
    frame(10003);
    expect(
      within(heroControls()).getByRole("button", { name: "Insight" }),
    ).toHaveAttribute("aria-pressed", "true");
    frame(10004);
    frame(15005);
    expect(
      screen.getByRole("button", { name: "Replay demo" }),
    ).toBeInTheDocument();
    expect(frames.size).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Replay demo" }));
    expect(
      within(heroControls()).getByRole("button", { name: "Upload" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("pauses, resumes, and stops autoplay after manual stage selection", () => {
    mount();
    observeHero(true);
    frame(0);
    frame(2000);
    fireEvent.click(screen.getByRole("button", { name: "Pause demo" }));
    expect(frames.size).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Play demo" }));
    frame(8000);
    frame(11001);
    expect(
      within(heroControls()).getByRole("button", { name: "Inspect" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(
      within(heroControls()).getByRole("button", { name: "Upload" }),
    );
    expect(frames.size).toBe(0);
    expect(
      screen.getByRole("button", { name: "Play demo" }),
    ).toBeInTheDocument();
    expect(
      within(storyControls()).getByRole("button", { name: "Upload" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("excludes time spent offscreen or in a hidden document", () => {
    mount();
    observeHero(true);
    frame(0);
    frame(2000);
    observeHero(false);
    expect(frames.size).toBe(0);
    observeHero(true);
    frame(20000);
    frame(22000);
    expect(
      within(heroControls()).getByRole("button", { name: "Upload" }),
    ).toHaveAttribute("aria-pressed", "true");
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    fireEvent(document, new Event("visibilitychange"));
    expect(frames.size).toBe(0);
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    fireEvent(document, new Event("visibilitychange"));
    frame(40000);
    frame(41001);
    expect(
      within(heroControls()).getByRole("button", { name: "Inspect" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("uses manual demos and workflow for reduced motion, including dynamic preference changes", () => {
    mount();
    observeHero(true);
    act(() => {
      reduced = true;
      mediaListeners.forEach((fn) => fn());
    });
    expect(
      screen.getByRole("button", { name: "Next demo stage" }),
    ).toBeInTheDocument();
    scroll(1900);
    expect(
      within(storyControls()).getByRole("button", { name: "Upload" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Next demo stage" }));
    expect(
      within(heroControls()).getByRole("button", { name: "Inspect" }),
    ).toHaveAttribute("aria-pressed", "true");
    act(() => {
      reduced = false;
      mediaListeners.forEach((fn) => fn());
    });
    expect(
      screen.getByRole("button", { name: "Play demo" }),
    ).toBeInTheDocument();
  });

  it("shows a manually selected hero stage without pausing its entrance forever", () => {
    const animations: {
      pause: ReturnType<typeof vi.fn>;
      play: ReturnType<typeof vi.fn>;
      cancel: ReturnType<typeof vi.fn>;
      playState: string;
    }[] = [];
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: vi.fn(() => {
        const animation = {
          pause: vi.fn(),
          play: vi.fn(),
          cancel: vi.fn(),
          playState: "running",
        };
        animations.push(animation);
        return animation;
      }),
    });
    const { container, unmount } = mount();
    observeHero(true);
    animations.length = 0;
    fireEvent.click(
      within(heroControls()).getByRole("button", { name: "Inspect" }),
    );
    expect(container.querySelector(".hero-demo [data-view]")).toHaveAttribute(
      "data-view",
      "preview",
    );
    const rowAnimations = animations.slice(-4);
    expect(rowAnimations).toHaveLength(4);
    expect(
      rowAnimations.every((animation) => animation.play.mock.calls.length > 0),
    ).toBe(true);
    unmount();
    expect(
      animations.every((animation) => animation.cancel.mock.calls.length > 0),
    ).toBe(true);
    delete (HTMLElement.prototype as unknown as { animate?: unknown }).animate;
  });
  it("starts with manual controls when reduced motion is already enabled", () => {
    reduced = true;
    mount();
    observeHero(true);
    frame(0);
    frame(10000);
    expect(
      within(heroControls()).getByRole("button", { name: "Upload" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Next demo stage" }),
    ).toBeInTheDocument();
    expect(frames.size).toBe(0);
  });
  it("cleans up observers, frames, preference listeners, and document title under Strict Mode", () => {
    const original = document.title;
    const { unmount } = mount(true);
    observeHero(true);
    frame(0);
    unmount();
    expect(frames.size).toBe(0);
    expect(mediaListeners.size).toBe(0);
    expect(
      disconnects.every((disconnect) => disconnect.mock.calls.length > 0),
    ).toBe(true);
    expect(document.title).toBe(original);
  });
});
