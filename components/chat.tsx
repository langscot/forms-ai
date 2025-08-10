"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useState } from "react";
import { Turnstile } from "next-turnstile";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import TextArea from "./ui/TextArea";
import Button from "./ui/Button";
import Message, { DumbAssistantMessage } from "./message";
import { MyUIMessage } from "@/app/types";
import ChatHeader from "./chat-header";
import { Field } from "@/forms/types";

export default function Chat({
  sectionContexts,
  currentSection,
  currentSectionContext,
  setState
}: {
  sectionContexts: {
    sectionIndex: number,
    title: string,
    context: string
  }[],
  currentSection: number, currentSectionContext: {
    sectionIndex: number,
    title: string,
    fields: (Field & { value: string })[]
  },
  setState: (updater: (prevState: Record<string, unknown>) => Record<string, unknown>) => void;
}) {
  const [input, setInput] = useState('');
  const [token, setToken] = useState('');
  const { messages, sendMessage, setMessages, status, addToolResult } = useChat<MyUIMessage>({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      console.log('toolCall', toolCall);
      if (toolCall.toolName === 'updateFormState') {
        const { dataName, value } = toolCall.input as { dataName: string, value: string };
        setState(prevState => ({ ...prevState, [dataName]: value }));
        addToolResult({
          tool: 'updateFormState',
          toolCallId: toolCall.toolCallId,
          output: 'Form state updated',
        })
      }
    }
  });

  const handleSendMessage = useCallback((message: string) => {
    console.log({
      // sectionContexts,
      currentSection,
      currentSectionContext
    })
    sendMessage({ text: message }, { body: { token, sectionContexts, currentSection, currentSectionContext } });
    setInput('');
  }, [sendMessage, token, sectionContexts, currentSection, currentSectionContext, setInput]);

  return (
    <div className="flex flex-col w-full mx-auto border-l border-gray-200 h-full max-h-full min-h-0 overflow-hidden">
      <div className="shrink-0">
        <ChatHeader setMessages={setMessages} />
      </div>

      <div className="flex flex-col overflow-y-auto flex-1 min-h-0">
        <DumbAssistantMessage message="Hi, I'm the AI Assistant. How can I help you today?" />
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}

      </div>

      {status === 'submitted' && messages.length > 0 && messages[messages.length - 1].role === 'user' && <DumbAssistantMessage message="Hmm..." />}

      {
        !token ?
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_CF_SITE_KEY!}
            retry='auto'
            refreshExpired='auto'
            sandbox={process.env.NODE_ENV === 'development'}
            onVerify={(token) => {
              setToken(token);
            }}
            appearance="execute"
          /> :
          <form
            className="pt-4 pb-6 px-4 border-t border-gray-200 shrink-0"
            onSubmit={e => {
              e.preventDefault();
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
              <Button type="submit" disabled={!input || !token || status === 'streaming' || status === 'submitted'}>Send</Button>
            </div>
          </form>
      }
    </div>
  );
}