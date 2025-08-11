import { MyUIMessage } from "@/app/types";
import Button from "./ui/Button";
import { UseChatHelpers } from "@ai-sdk/react";
import { RefreshCcwIcon } from "lucide-react";

export default function ChatHeader({
  setMessages,
  isWidget,
  setOpen,
}: {
  setMessages: UseChatHelpers<MyUIMessage>['setMessages']
  isWidget?: boolean;
  setOpen?: (open: boolean) => void;
}) {
  return <div className="flex items-center justify-between p-4 border-b border-gray-200">
    <h1 className="text-2xl font-bold">AI Assistant</h1>
    <div className="flex items-center gap-2">
      <Button variant="secondary" type="button" onClick={() => setMessages([])}>
        {isWidget ? <RefreshCcwIcon size={18} /> : 'New chat'}
      </Button>
      {
        isWidget && (
          <Button variant="secondary" type="button" onClick={() => setOpen?.(false)}>
            Minimize
          </Button>
        )
      }
    </div>
  </div>;
}