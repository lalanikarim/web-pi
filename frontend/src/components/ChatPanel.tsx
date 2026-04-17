import { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { useModels } from '../hooks/useModels';
import './components.css';

const MOCK_REPLIES = [
  "I've analyzed the project structure. This appears to be a FastAPI + React Pi integration project. Let me know what you'd like to work on!",
  "Looking at the file tree, I can see the backend is set up with FastAPI routers. Would you like me to help implement the WebSocket chat endpoint?",
  "I notice the frontend is built with Vite + React 19. I can help with the file tree component, file preview, or the chat interface.",
  "The project structure looks good. I see we have backend API routers for projects, sessions, files, and models. What would you like to add or modify?",
  "I can see the integration plan covers project selection, session management, file navigation, model switching, and chat. Let me know which part you'd like to tackle next.",
];

export default function ChatPanel() {
  const { currentModel, switchModel, setSelectedModel } = useApp();
  const { models } = useModels();

  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: number }>>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock reply
    setTimeout(() => {
      const reply: typeof messages[number] = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSwitchModel = (model: typeof models[0]) => {
    switchModel(model);
    setSelectedModel(model);
    setModelDropdownOpen(false);
  };

  return (
    <div className="panel panel--chat">
      <div className="panel__header panel__header--chat">
        <span>Chat</span>
        <div className="model-picker model-picker--compact" ref={null}>
          <div className="model-picker__dropdown" style={{ position: 'relative' }}>
            <button
              className="model-picker__trigger"
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              title="Switch model"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
              </svg>
              <span className="model-picker__label">{currentModel?.name}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {modelDropdownOpen && (
              <div className="model-picker__menu model-picker__menu--compact">
                {models.map((model) => (
                  <button
                    key={model.id}
                    className={`model-picker__item ${currentModel?.id === model.id ? 'model-picker__item--active' : ''}`}
                    onClick={() => handleSwitchModel(model)}
                  >
                    <div className="model-picker__item-name">{model.name}</div>
                    <div className="model-picker__item-meta">{model.provider}</div>
                    {currentModel?.id === model.id && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel__content panel__content--chat">
        {messages.length === 0 && (
          <div className="chat-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>Start a conversation with Pi</p>
            <p className="chat-empty__hint">Select a model above and type a message</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
            <div className="chat-message__avatar">
              {msg.role === 'user' ? 'You' : 'π'}
            </div>
            <div className="chat-message__body">
              <div className="chat-message__role">
                {msg.role === 'user' ? 'You' : 'Pi'}
                <span className="chat-message__time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="chat-message__content">{msg.content}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-message chat-message--assistant">
            <div className="chat-message__avatar">π</div>
            <div className="chat-message__body">
              <div className="chat-message__role">Pi</div>
              <div className="chat-message__typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="panel__input">
        <input
          ref={inputRef}
          type="text"
          placeholder="Message Pi..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
        />
        <button
          className="btn btn--send"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
