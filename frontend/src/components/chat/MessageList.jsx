import { AnimatePresence } from "framer-motion";
import { useAutoScroll } from "../../hooks/useAutoScroll.js";
import MessageBubble from "./MessageBubble.jsx";

export default function MessageList({ messages }) {
  const bottomRef = useAutoScroll(messages.length);

  return (
    <section className="chat-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
