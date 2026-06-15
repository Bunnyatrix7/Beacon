import { useState } from "react";
import { motion } from "framer-motion";
import { FiPaperclip, FiSend, FiSmile } from "react-icons/fi";
import IconButton from "../ui/IconButton.jsx";

export default function MessageComposer({ onSend }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  };

  return (
    <footer className="border-t border-[var(--glass-border)] p-3 sm:p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-[24px] border border-[var(--glass-border)] bg-[var(--composer-bg)] p-2 shadow-glass backdrop-blur-glass">
        <IconButton label="Attach file">
          <FiPaperclip />
        </IconButton>
        <textarea
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Message Beacon..."
          className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
        <IconButton label="Emoji picker">
          <FiSmile />
        </IconButton>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={submit}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent)] text-white shadow-glow outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          aria-label="Send message"
        >
          <FiSend />
        </motion.button>
      </div>
    </footer>
  );
}
