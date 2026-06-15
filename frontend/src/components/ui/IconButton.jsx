import { motion } from "framer-motion";

export default function IconButton({ label, children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-soft)] text-[var(--text-secondary)] outline-none transition hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
      aria-label={label}
      title={label}
      type="button"
    >
      {children}
    </motion.button>
  );
}
