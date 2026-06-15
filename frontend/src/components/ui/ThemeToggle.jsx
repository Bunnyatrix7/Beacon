import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext.jsx";

const modes = [
  { id: "system", icon: <FiMonitor />, label: "System theme" },
  { id: "light", icon: <FiSun />, label: "Light theme" },
  { id: "dark", icon: <FiMoon />, label: "Dark theme" }
];

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const index = modes.findIndex((item) => item.id === mode);
  const next = modes[(index + 1) % modes.length];

  return (
    <button
      type="button"
      onClick={() => setMode(next.id)}
      className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--glass-soft)] text-[var(--text-secondary)] outline-none transition hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
      aria-label={`Switch to ${next.label}`}
      title={`Current: ${modes[index]?.label || "System theme"}`}
    >
      {modes[index]?.icon || <FiMonitor />}
    </button>
  );
}
