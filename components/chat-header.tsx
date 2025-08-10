import { MyUIMessage } from "@/app/types";
import Button from "./ui/Button";
import { UseChatHelpers } from "@ai-sdk/react";

export default function ChatHeader({
  setMessages
}: {
  setMessages: UseChatHelpers<MyUIMessage>['setMessages']
}) {
  return <div className="flex items-center justify-between p-4 border-b border-gray-200">
    <h1 className="text-2xl font-bold">AI Assistant</h1>
    <div className="flex items-center gap-2">
      <Button variant="secondary" type="button" onClick={() => setMessages([])}>
        Refresh Chat
      </Button>
    </div>
  </div>;
}