import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiHash, FiRadio } from "react-icons/fi";
import { channels, onlineUsers } from "../../data/channels.js";
import ChannelItem from "../ui/ChannelItem.jsx";
import GlassPanel from "../ui/GlassPanel.jsx";
import IconButton from "../ui/IconButton.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import UserProfile from "../ui/UserProfile.jsx";

export default function Sidebar({ activeChannel, collapsed, onChannelChange, onToggle, status }) {
  return (
    <GlassPanel className="flex h-full min-h-[calc(100vh-2rem)] flex-col p-3">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent)] text-lg font-black text-white shadow-glow"
          >
            B
          </motion.div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold tracking-wide">Beacon</h1>
              <p className="text-xs text-[var(--text-muted)]">AI chat workspace</p>
            </div>
          )}
        </div>
        <IconButton label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={onToggle}>
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </IconButton>
      </div>

      <div className="space-y-2">
        {!collapsed && <p className="px-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Channels</p>}
        {channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            active={activeChannel === channel.id}
            collapsed={collapsed}
            icon={<FiHash />}
            label={channel.name}
            unread={channel.unread}
            onClick={() => onChannelChange(channel.id)}
          />
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {!collapsed && <p className="px-3 text-xs font-semibold uppercase text-[var(--text-muted)]">Online</p>}
        {onlineUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm">
            <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${user.color}`} />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{user.role}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-3 pt-5">
        <div className="flex items-center justify-between rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-soft)] px-3 py-2">
          <div className="flex items-center gap-2">
            <FiRadio className={status === "online" ? "text-emerald-400" : "text-amber-400"} />
            {!collapsed && <span className="text-xs capitalize text-[var(--text-muted)]">{status}</span>}
          </div>
          {!collapsed && <ThemeToggle />}
        </div>
        <UserProfile collapsed={collapsed} />
      </div>
    </GlassPanel>
  );
}
