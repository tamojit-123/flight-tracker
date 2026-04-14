'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { ActionIcon, Drawer, Textarea, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { motion, AnimatePresence } from 'motion/react';
import { IconPlane, IconSend, IconX } from '@tabler/icons-react';
import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import { MessageBubble, EmptyChat } from './MessageBubble';
import { ThinkingPulse } from './ThinkingPulse';
import { sanitizePrompt } from '@/lib/promptSanitizer';
import styles from '@/styles/modules/AICopilot.module.css';

const MAX_HISTORY = 20;
const MAX_MESSAGE_LENGTH = 500;

export function AICopilot() {
  const [opened, { open, close }] = useDisclosure(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const { copilotOpen, setCopilotOpen } = useUIStore();
  const { messages, addMessage, appendToken, setStreaming, clearChat } = useChatStore();

  useEffect(() => {
    if (copilotOpen) open();
    else close();
  }, [copilotOpen, open, close]);

  const handleClose = () => {
    setCopilotOpen(false);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    const sanitized = sanitizePrompt(input);
    if (!sanitized || sanitized.length === 0 || isLoading) return;

    if (sanitized.length > MAX_MESSAGE_LENGTH) {
      notifications.show({
        title: 'Message too long',
        message: `Maximum ${MAX_MESSAGE_LENGTH} characters allowed`,
        color: 'red',
      });
      return;
    }

    const userMessage = { role: 'user', content: sanitized };
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    const aiMessage = { role: 'assistant', content: '', isStreaming: true };
    addMessage(aiMessage);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(-MAX_HISTORY).concat(userMessage),
          flightContext: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API error');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setStreaming(false);
              const msgs = useChatStore.getState().messages;
              const lastMsg = msgs[msgs.length - 1];
              if (lastMsg && lastMsg.isStreaming) {
                useChatStore.setState({
                  messages: msgs.map((m, i) =>
                    i === msgs.length - 1 ? { ...m, isStreaming: false } : m
                  ),
                });
              }
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.token) {
                  appendToken(parsed.token);
                } else if (parsed.error) {
                  console.error('Chat error:', parsed.error);
                }
              } catch (e) {
                // Ignore parse errors for partial data
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      notifications.show({
        title: 'Chat Error',
        message: 'Failed to get AI response. Please try again.',
        color: 'red',
      });

      const msgs = useChatStore.getState().messages;
      if (msgs.length && msgs[msgs.length - 1].isStreaming) {
        useChatStore.setState({
          messages: msgs.slice(0, -1),
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, addMessage, appendToken, setStreaming]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <ActionIcon
        size={60}
        variant="default"
        className="pulse-ring glow-cyan"
        onClick={() => setCopilotOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: 'rgba(8, 12, 20, 0.9)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '12px',
          width: 60,
          height: 60,
        }}
        title="Open AI Copilot"
      >
        <IconPlane size={28} color="#00D4FF" />
      </ActionIcon>

      <Drawer
        opened={opened}
        onClose={handleClose}
        position="right"
        size={420}
        withCloseButton={false}
        className={styles.drawer}
        styles={{
          content: {
            background: 'rgba(8, 12, 20, 0.88)',
            backdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(0, 212, 255, 0.15)',
          },
          header: { background: 'transparent' },
          body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' },
        }}
      >
        <div className={styles.header} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconPlane size={20} color="#00D4FF" />
            <span className={styles.title}>FLIGHT AI COPILOT</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {messages.length > 0 && (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={clearChat}
                title="Clear chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </ActionIcon>
            )}
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={handleClose}
            >
              <IconX size={16} />
            </ActionIcon>
          </div>
        </div>

        <ScrollArea
          ref={scrollRef}
          flex={1}
          className={styles.messages}
          style={{ flex: 1 }}
        >
          {messages.length === 0 ? (
            <EmptyChat />
          ) : (
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))}
            </AnimatePresence>
          )}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className={styles.messageWrapper}>
              <Paper className={`${styles.bubble} ${styles.aiBubble}`} p="sm">
                <ThinkingPulse />
              </Paper>
            </div>
          )}
        </ScrollArea>

        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <Textarea
              ref={inputRef}
              className={styles.textarea}
              placeholder="Ask about flights, weather, routes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autosize
              minRows={1}
              maxRows={4}
              disabled={isLoading}
            />
            <ActionIcon
              className={styles.sendButton}
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              size={44}
            >
              <IconSend size={18} />
            </ActionIcon>
          </div>
        </div>
      </Drawer>
    </>
  );
}