import { vi } from "vitest";
import { useDebounce } from "../../app/composables/useDebounce.ts";

describe("useDebounce", () => {
  it("calls function after delay", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = useDebounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
