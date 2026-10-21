export function useTheme() {
  const isDark = useState("isDark", () => {
    if (!import.meta.client) return false;
    // Check localStorage first
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    // Fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const applyTheme = (dark: boolean) => {
    if (!import.meta.client) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
    isDark.value = dark;
  };

  const toggle = () => {
    applyTheme(!isDark.value);
  };

  onMounted(() => {
    const stored = localStorage.getItem("theme");
    if (stored) {
      applyTheme(stored === "dark");
    } else {
      // Use system preference if no localStorage
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      applyTheme(prefersDark);
    }
  });

  return { isDark, toggle };
}
