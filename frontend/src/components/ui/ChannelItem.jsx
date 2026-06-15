import { motion } from "framer-motion";

export default function ChannelItem({ active, collapsed, icon, label, unread, onClick }) {
  return (
    <motion.button
      whileHover={{ x: collapsed ? 0 : 3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
        active
          ? "bg-[var(--active-channel)] text-[var(--text-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--glass-soft)] hover:text-[var(--text-primary)]"
      }`}
      type="button"
      title={label}
    >
      {active && (
        <motion.span
          layoutId="active-channel"
          className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[var(--accent)]"
        />
      )}
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--glass-soft)]">{icon}</span>
      {!collapsed && <span className="min-w-0 flex-1 truncate font-medium">{label}</span>}
      {!collapsed && unread > 0 && (
        <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-semibold text-white">{unread}</span>
      )}
    </motion.button>
  );
}
