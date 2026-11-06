import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Download,
  Volume2,
  VolumeX,
  Copy,
  Check,
  AlertCircle,
  Mic,
  MicOff,
  Headphones,
  RotateCcw,
  PieChart,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { FinancialProfile, ChatMessage } from '../types/financial';
import { MarkdownRenderer } from '../utils/markdownRenderer';

interface ChatAdvisorProps {
  activeProfile: FinancialProfile;
  initialMessageToSend?: string;
  onClearInitialMessage?: () => void;
  onSwitchTab?: (tab: 'budget' | 'loan' | 'invest') => void;
  onOpenVoiceMode?: () => void;
}

const PRESET_PROMPTS = [
  {
    label: '50/30/20 Budgeting',
    prompt: 'How should I allocate my monthly income using the 50/30/20 rule? Break down the exact dollar amounts for my needs, wants, and savings.',
  },
  {
    label: 'Avalanche vs Snowball',
    prompt: 'Compare the Debt Avalanche and Debt Snowball methods for my debts. Which saves more money and which builds faster psychological momentum?',
  },
  {
    label: 'Emergency Fund Sizing',
    prompt: 'How many months of emergency fund do I need based on my monthly needs, and where is the best place to keep it (HYSA, MMF, or CDs)?',
  },
  {
    label: 'Invest vs Pay Debt',
    prompt: 'Should I prioritize investing in low-cost index funds (like S&P 500) or aggressively paying off my existing debts? What is the mathematical threshold?',
  },
  {
    label: 'Financial Order of Operations',
    prompt: 'Walk me through the step-by-step Financial Order of Operations: employer 401(k) match, high-interest debt, emergency reserves, Roth IRA, and taxable brokerage.',
  },
];

export const ChatAdvisor: React.FC<ChatAdvisorProps> = ({
  activeProfile,
  initialMessageToSend,
  onClearInitialMessage,
  onSwitchTab,
  onOpenVoiceMode,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Welcome to FinPulse AI!** I am your intelligent financial advisor and planning guide.

I have loaded your profile for **${activeProfile.personaName}** ($${activeProfile.monthlyIncome.toLocaleString()}/mo net income, $${activeProfile.totalDebt.toLocaleString()} total debt, and $${activeProfile.currentSavings.toLocaleString()} liquid savings).

You can speak to me with your voice or type your inquiries regarding:
- **Budgeting**: Optimizing 50/30/20 allocation or trimming discretionary leakage
- **Debt & Loans**: Comparing Avalanche vs. Snowball payoff timelines
- **Emergency Funds & Savings**: Calculating target runway and high-yield account strategies
- **Investing & Growth**: Index funds, 401(k) employer matches, and compound interest math

Pick a prompt below, tap the microphone to speak, or launch Voice Mode:
[Suggestions]
• How should I allocate my monthly income using the 50/30/20 rule?
• Compare the Debt Avalanche and Debt Snowball methods for my debts.
• Should I invest in index funds or pay off my debt first?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [lastPromptAttempted, setLastPromptAttempted] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dictationRecognitionRef = useRef<any>(null);

  // Auto-scroll on new message chunks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Handle external message requests (e.g. from Budget or Loan calculator)
  useEffect(() => {
    if (initialMessageToSend && !isStreaming) {
      sendMessage(initialMessageToSend);
      onClearInitialMessage?.();
    }
  }, [initialMessageToSend]);

  // Setup inline microphone dictation
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsDictating(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInput(currentTranscript);
        };

        recognition.onerror = () => {
          setIsDictating(false);
        };

        recognition.onend = () => {
          setIsDictating(false);
        };

        dictationRecognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition not available for dictation', e);
      }
    }
  }, []);

  const toggleDictation = () => {
    if (!dictationRecognitionRef.current) return;

    if (isDictating) {
      dictationRecognitionRef.current.stop();
      setIsDictating(false);
    } else {
      try {
        dictationRecognitionRef.current.start();
      } catch (e) {
        dictationRecognitionRef.current.stop();
        setTimeout(() => dictationRecognitionRef.current.start(), 200);
      }
    }
  };

  const sendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isStreaming) return;

    if (isDictating) {
      dictationRecognitionRef.current?.stop();
      setIsDictating(false);
    }

    setErrorMessage(null);
    setLastPromptAttempted(text);
    setInput('');

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Placeholder assistant message for streaming
    const assistantMessageId = `ast-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...newMessages, assistantMessage]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userProfile: activeProfile,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedContent += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
                  )
                );
              } else if (parsed.error) {
                setErrorMessage(parsed.error);
              }
            } catch (err) {
              // Ignore partial chunks
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream stopped by user');
      } else {
        console.error('Chat error:', err);
        setErrorMessage(err.message || 'Temporary service interruption. Click Retry to re-send.');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    '⚠️ High demand on the primary AI cluster. Please click the Retry button below or select one of the suggested inquiries to receive instant guidance.',
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRetry = () => {
    if (lastPromptAttempted) {
      sendMessage(lastPromptAttempted);
    }
  };

  const handleClearChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat session refreshed for **${activeProfile.personaName}**. Ask me any question on budgeting, loans, savings, or investments!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\[Suggestions\][\s\S]*$/, '')
      .replace(/[*#`_~]/g, '')
      .replace(/\|.*\|/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleExportTranscript = () => {
    const transcript = messages
      .map(
        (m) =>
          `### [${m.role.toUpperCase()}] - ${m.timestamp}\n\n${m.content}\n\n---\n`
      )
      .join('\n');

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinPulse_Financial_Consultation_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      {/* Light Glass Context Bar */}
      <div className="glass-panel rounded-2xl px-4 py-3 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {activeProfile.personaName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">
                Persona: {activeProfile.personaName}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono tabular-nums text-slate-600">
                Net: ${activeProfile.monthlyIncome.toLocaleString()}/mo
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono tabular-nums text-slate-600">
                Debt: ${activeProfile.totalDebt.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-xl">
              Goal: {activeProfile.financialGoal}
            </p>
          </div>
        </div>

        {/* Right Action Cluster: Voice Mode + Quick Tools */}
        <div className="flex items-center gap-2">
          {onOpenVoiceMode && (
            <button
              onClick={onOpenVoiceMode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Launch Live Voice Mode"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voice Mode</span>
            </button>
          )}

          {onSwitchTab && (
            <div className="hidden sm:flex items-center gap-1 text-xs">
              <button
                onClick={() => onSwitchTab('budget')}
                className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/70 rounded-lg transition-colors flex items-center gap-1"
              >
                <PieChart className="w-3.5 h-3.5 text-slate-500" />
                <span>Budget</span>
              </button>
              <button
                onClick={() => onSwitchTab('loan')}
                className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/70 rounded-lg transition-colors flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                <span>Loans</span>
              </button>
              <button
                onClick={() => onSwitchTab('invest')}
                className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/70 rounded-lg transition-colors flex items-center gap-1"
              >
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Invest</span>
              </button>
            </div>
          )}

          <button
            onClick={handleExportTranscript}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white/70 rounded-lg transition-colors"
            title="Export Consultation Transcript (.md)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearChat}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error / Demand Notice with Retry */}
      {errorMessage && (
        <div className="glass-panel border-amber-300 bg-amber-50/80 text-amber-900 px-4 py-2.5 rounded-xl mb-3 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-3">
            {lastPromptAttempted && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-700 hover:text-amber-950 font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Messages Stream Container with Light Glass Aesthetics */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`group relative rounded-2xl p-4 sm:p-5 transition-all ${
                  isUser
                    ? 'glass-bubble-user rounded-br-xs max-w-xl'
                    : 'glass-bubble-ai text-slate-900 rounded-bl-xs max-w-3xl'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span
                    className={`text-xs font-semibold ${
                      isUser ? 'text-slate-300' : 'text-emerald-700'
                    }`}
                  >
                    {isUser ? 'You' : 'FinPulse AI Advisor'}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono tabular-nums">{message.timestamp}</span>
                    {!isUser && message.content && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className="p-1 hover:text-slate-700 rounded transition-colors"
                          title="Copy message"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSpeak(message.id, message.content)}
                          className="p-1 hover:text-slate-700 rounded transition-colors"
                          title="Read aloud"
                        >
                          {speakingMessageId === message.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                {isUser ? (
                  <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                ) : message.content ? (
                  <MarkdownRenderer
                    content={message.content}
                    onSuggestionClick={(suggestion) => sendMessage(suggestion)}
                  />
                ) : (
                  <div className="flex items-center gap-2 py-2 text-slate-400 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>FinPulse is formulating financial guidance...</span>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Starters in Light Glass Pills */}
      <div className="pt-3 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Quick Inquiries:
          </span>
          {PRESET_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(item.prompt)}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-xl glass-card text-slate-700 hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Light Glass Input Bar with Microphone Dictation */}
      <div className="glass-input-bar rounded-2xl p-2 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          {/* Inline Microphone Dictate Button */}
          <button
            type="button"
            onClick={toggleDictation}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isDictating
                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30 ring-2 ring-red-300'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100/60'
            }`}
            title={isDictating ? 'Stop listening' : 'Speak your question (Voice Dictation)'}
          >
            {isDictating ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isDictating
                ? 'Listening to your speech... Speak now'
                : `Ask about budgeting, debt payoff, HYSA, 401(k), or investments for ${activeProfile.personaName}...`
            }
            disabled={isStreaming}
            className="flex-1 px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-50"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={handleStopStreaming}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-40 rounded-xl transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Ask Advisor</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      <div className="mt-2 text-center text-xs text-slate-400">
        FinPulse provides algorithmic & AI financial education. Verify with a certified fiduciary or CPA before executing major legal or tax transactions.
      </div>
    </div>
  );
};
