"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import TextArea from "./ui/TextArea";
import Button from "./ui/Button";
import Message, { DumbAssistantMessage } from "./message";
import { MyUIMessage } from "@/app/types";
import ChatHeader from "./chat-header";

export default function Chat({
  body,
  setState,
  isWidget,
  cfToken
}: {
  body: Record<string, unknown>,
  setState: (updater: (prevState: Record<string, unknown>) => Record<string, unknown>) => void;
  isWidget?: boolean;
  cfToken: string;
}) {
  const [input, setInput] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [open, setOpen] = useState(false);

  const context = useRef({
    token: cfToken,
    ...body
  })

  useEffect(() => {
    context.current = {
      token: cfToken,
      ...body
    };
  }, [cfToken, body]);

  const { messages, sendMessage, setMessages, status, addToolResult } = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      prepareSendMessagesRequest: ({ messages }) => {
        return {
          body: {
            messages,
            ...context.current
          }
        }
      }
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === 'updateFormState') {
        const { dataName, value } = toolCall.input as { dataName: string, value: string };
        setState(prevState => {
          const newState = { ...prevState, [dataName]: value };
          return newState;
        });
        addToolResult({
          tool: 'updateFormState',
          toolCallId: toolCall.toolCallId,
          output: 'Form state updated',
        })
      }
    },
  });

  const handleSendMessage = (message: string) => {
    sendMessage({ text: message });
    setInput('');
  }

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const thresholdPx = 80; // allow some leeway before disabling auto-scroll
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScrollEnabled(distanceFromBottom <= thresholdPx);
  }, []);

  // On new content, if the user is near the bottom, keep them pinned to the bottom
  useEffect(() => {
    if (!autoScrollEnabled) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
  }, [messages, status, autoScrollEnabled]);

  // On mount, start at the bottom if there is content
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
  }, []);

  const chatBody = (
    <div className={`flex flex-col w-full mx-auto border-gray-200 h-full max-h-full min-h-0 overflow-hidden ${!isWidget ? 'border-l' : ''}`}>
      <div className="shrink-0">
        <ChatHeader setMessages={setMessages} isWidget={isWidget} setOpen={setOpen} />
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-col overflow-y-auto overscroll-contain flex-1 min-h-0 pb-[12vh]"
      >
        <DumbAssistantMessage message={`Hi! I'm your AI assistant, here to help you with this form.\n\nYou can ask me any questions about the form or ask for clarification on anything that's unclear.\n\nIf you'd like, I can also guide you through the form step by step, and any answers you give me—I can fill them in for you automatically.\n\nJust let me know how you'd like to get started!`} />
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
      </div>

      <form
        className="pt-4 pb-6 px-4 border-t border-gray-200 shrink-0"
        onSubmit={e => {
          e.preventDefault();
          // When user sends a message, re-enable autoscroll and jump to bottom
          setAutoScrollEnabled(true);
          handleSendMessage(input);
        }}
      >
        <TextArea
          value={input}
          rows={3}
          hint="Type your message to the AI here"
          labelSize="l"
          placeholder="Enter your message..."
          onChange={e => setInput(e.currentTarget.value)}
          className="flex-1"
        />
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            disabled={!input || (process.env.NODE_ENV !== 'development' && !cfToken) || status === 'streaming' || status === 'submitted'}
          >
            Send
          </Button>
        </div>
      </form>

    </div>
  )

  if (isWidget) {
    return <div className="fixed bottom-10 right-10">
      <Button
        variant={open ? 'secondary' : 'default'}
        type="button"
        onClick={() => setOpen?.(!open)}
        className="govuk-button--start z-90"
        disabled={process.env.NODE_ENV !== 'development' && !cfToken}
      >
        {open ? 'Close Chat' : 'Open Chat'}
      </Button>
      {open && <div className="z-100 md:h-[80vh] md:max-h-[80vh] overflow-y-auto shadow-2xl fixed top-0 right-0 bottom-0 left-0 md:bottom-25 md:right-10 md:left-auto md:top-auto bg-white w-full md:max-w-md md:border border-gray-200">
        {chatBody}
      </div>}
    </div>
  }

  return chatBody;
}