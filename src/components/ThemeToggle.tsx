import { setTheme, theme, type Theme } from "../ui/theme";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function ThemeToggle() {
  return (
    <label class="footer-theme">
      Theme
      <select
        class="btn"
        value={theme.value}
        onChange={(event) =>
          setTheme((event.target as HTMLSelectElement).value as Theme)
        }
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
