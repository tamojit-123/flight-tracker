'use client';
import { useEffect, useState, useRef } from 'react';
import { Paper } from '@mantine/core';
import { motion } from 'motion/react';
import styles from '@/styles/modules/AICopilot.module.css';

export function MessageBubble({ message }) {
  const [displayContent, setDisplayContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const contentRef = useRef(message.content || '');
  const streamRef = useRef(null);

  useEffect(() => {
    if (!message.content) return;

    if (message.role === 'assistant' && message.isStreaming) {
      setIsStreaming(true);
      let currentIndex = 0;
      const charsToReveal = message.content.length;

      const revealChars = () => {
        currentIndex += 3;
        if (currentIndex >= charsToReveal) {
          setDisplayContent(message.content);
          setIsStreaming(false);
          return;
        }
        setDisplayContent(message.content.slice(0, currentIndex));
        streamRef.current = requestAnimationFrame(revealChars);
      };

      streamRef.current = requestAnimationFrame(revealChars);

      return () => {
        if (streamRef.current) {
          cancelAnimationFrame(streamRef.current);
        }
      };
    } else {
      setDisplayContent(message.content);
    }
  }, [message.content, message.role, message.isStreaming]);

  const isUser = message.role === 'user';
  const isAI = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`${styles.messageWrapper} ${isUser ? styles.userMessage : styles.aiMessage}`}
    >
      <Paper
        className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble}`}
        p="sm"
      >
        <div className={`${styles.role} ${isUser ? styles.userRole : styles.aiRole}`}>
          {isUser ? 'You' : 'FlightAI'}
        </div>
        <div className={styles.content}>
          {displayContent}
          {isStreaming && (
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '14px',
              background: 'var(--cyan)',
              marginLeft: '2px',
              animation: 'blink 0.8s step-end infinite',
            }} />
          )}
        </div>
      </Paper>
    </motion.div>
  );
}

export function EmptyChat() {
  const quickIntents = [
    { label: 'Explain altitude trends', query: 'What does the altitude profile tell me about this flight?' },
    { label: 'Weather impact', query: 'How might weather affect this flight?' },
    { label: 'Flight path info', query: 'What is the typical route for this flight?' },
    { label: 'Aircraft details', query: 'Tell me about this aircraft type' },
  ];

  const { addMessage } = require('@/store/chatStore').useChatStore.getState();

  const handleIntent = (query) => {
    addMessage({ role: 'user', content: query });
  };

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L8 6H4l-2 4 4 2v8l2 2 2-2h4l2 2 2-2v-8l4-2-2-4h-4l-4-4z" />
        </svg>
      </div>
      <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '13px', color: 'var(--cyan)', letterSpacing: '0.1em' }}>
        FLIGHT AI COPILOT
      </div>
      <div className={styles.emptyText}>
        Ask questions about flights, weather, or aviation. The AI will provide insights based on available data.
      </div>
      <div className={styles.quickIntents}>
        {quickIntents.map((intent, i) => (
          <button
            key={i}
            className={styles.chip}
            onClick={() => handleIntent(intent.query)}
          >
            {intent.label}
          </button>
        ))}
      </div>
    </div>
  );
}