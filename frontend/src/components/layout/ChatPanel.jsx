import ChatHeader from "../chat/ChatHeader.jsx";
import MessageComposer from "../chat/MessageComposer.jsx";
import MessageList from "../chat/MessageList.jsx";
import GlassPanel from "../ui/GlassPanel.jsx";

export default function ChatPanel({ channelName, messages, onSend, socketStatus }) {
  return (
    <GlassPanel className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col overflow-hidden">
      <ChatHeader channelName={channelName} socketStatus={socketStatus} />
      <MessageList messages={messages} />
      <MessageComposer onSend={onSend} />
    </GlassPanel>
  );
}
