import MarkdownBlock from "./ui/MarkdownBlock";
import Tag from "./ui/Tag";
import { MyUIMessage } from "@/app/types";

export default function Message({ message }: { message: MyUIMessage }) {
  return <div className="flex flex-col p-4 border-b border-gray-200">
    <div className="flex gap-2 items-center justify-between mb-6">
      <Tag variant={message.role === 'user' ? 'blue' : 'green'}>{message.role === 'user' ? 'You' : 'AI Assistant'}</Tag>
      <span className="text-sm text-gray-500">
        {new Date(message.metadata?.createdAt ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {' '}
        {message.metadata?.totalTokens && message.metadata?.totalTokens > 0 ? `(${message.metadata?.totalTokens} tokens)` : ''}
      </span>
    </div>
    <div className="flex flex-col space-y-4">
      {message.parts.map((part, i) => {
        switch (part.type) {
          case 'text':
            return <MarkdownBlock key={`${message.id}-${i}`} markdown={part.text} />;
        }
      })}
    </div>
  </div>;
}

export function DumbAssistantMessage({ message }: { message: string }) {
  return <div className="flex flex-col p-4 border-b border-gray-200">
    <div className="flex gap-2 items-center justify-between mb-6">
      <Tag variant="green">AI Assistant</Tag>
    </div>
    <div className="flex flex-col space-y-4">
      <MarkdownBlock markdown={message} />
    </div>
  </div>
}