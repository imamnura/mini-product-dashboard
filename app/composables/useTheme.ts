export function useTheme() {
  const isDark = useState("isDark", () => {
    if (!process.client) return false;
    // Check localStorage first
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    // Fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const applyTheme = (dark: boolean) => {
    if (!process.client) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
    isDark.value = dark;
  };

  const toggle = () => {
    applyTheme(!isDark.value);
  };

  onMounted(() => {
    if (!process.client) return;
    const stored = localStorage.getItem("theme");
    if (stored) {
      applyTheme(stored === "dark");
    } else {
      // Use system preference if no localStorage
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches;
      applyTheme(prefersDark);
    }
  });

  return { isDark, toggle };
}
