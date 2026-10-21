import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls the function after the given delay", () => {
    const fn = vi.fn();
    const debounced = useDebounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("forwards the arguments of the last call", () => {
    const fn = vi.fn();
    const debounced = useDebounce(fn, 100);

    debounced("a", 1);
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith("a", 1);
  });

  it("only runs once for rapid successive calls", () => {
    const fn = vi.fn();
    const debounced = useDebounce(fn, 200);

    debounced("first");
    vi.advanceTimersByTime(150);
    debounced("second");
    vi.advanceTimersByTime(150);
    debounced("third");
    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("third");
  });

  it("uses a default delay of 300ms", () => {
    const fn = vi.fn();
    const debounced = useDebounce(fn);

    debounced();
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
