import { FiSearch, FiUsers } from "react-icons/fi";
import IconButton from "../ui/IconButton.jsx";

export default function ChatHeader({ channelName, socketStatus }) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--glass-border)] px-4 py-4 sm:px-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold sm:text-xl">{channelName}</h2>
          <span className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft)] px-2.5 py-1 text-xs capitalize text-[var(--text-muted)]">
            {socketStatus}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Premium glass chat interface for real-time rooms.</p>
      </div>

      <div className="flex items-center gap-2">
        <IconButton label="Search">
          <FiSearch />
        </IconButton>
        <IconButton label="Members">
          <FiUsers />
        </IconButton>
      </div>
    </header>
  );
}
