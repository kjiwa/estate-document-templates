import { setTheme, theme, type Theme } from "../ui/theme";

const label = document.querySelector<HTMLLabelElement>(".footer-theme");
const select = label?.querySelector("select");

if (label && select) {
  select.value = theme.value;
  select.addEventListener("change", () => setTheme(select.value as Theme));
  label.hidden = false;
}
