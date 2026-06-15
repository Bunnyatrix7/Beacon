import { FiMic, FiSettings } from "react-icons/fi";

export default function UserProfile({ collapsed }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-soft)] p-2">
      <div className="h-10 w-10 rounded-2xl bg-[var(--user-avatar)] shadow-glow" />
      {!collapsed && (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Bunny</p>
            <p className="truncate text-xs text-[var(--text-muted)]">Available</p>
          </div>
          <button className="text-[var(--text-muted)] transition hover:text-[var(--text-primary)]" aria-label="Mute">
            <FiMic />
          </button>
          <button className="text-[var(--text-muted)] transition hover:text-[var(--text-primary)]" aria-label="Settings">
            <FiSettings />
          </button>
        </>
      )}
    </div>
  );
}
