export default function GlassPanel({ className = "", children }) {
  return <div className={`glass-panel ${className}`}>{children}</div>;
}
