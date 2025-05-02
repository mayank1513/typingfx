import { vi } from "vitest";

// Mock matchMedia to simulate reduced-motion preference
vi.stubGlobal(
  "matchMedia",
  vi.fn().mockImplementation(query => ({
    matches: query === "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);
