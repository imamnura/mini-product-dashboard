export function useDebounce<T extends (...a: any[]) => any>(
  fn: T,
  delay = 300
) {
  let t: any;
  return (...arg: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => {
      fn(...arg);
    }, delay);
  };
}
