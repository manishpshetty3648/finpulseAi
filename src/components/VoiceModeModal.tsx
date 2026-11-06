import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  RefreshCw,
  Square,
  Play,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { FinancialProfile } from '../types/financial';

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: FinancialProfile;
  onSendMessage: (text: string) => Promise<string | void>;
  isStreamingResponse: boolean;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onSendMessage,
  isStreamingResponse,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [transcript, setTranscript] = useState('');
  const [lastUserSpeech, setLastUserSpeech] = useState('');
  const [lastBotResponse, setLastBotResponse] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  // Initialize Web Speech Recognition
  useEffect(() => {
    isComponentMounted.current = true;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechRecognition(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText('listening');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        if (event.results[0].isFinal) {
          const finalQuery = currentTranscript.trim();
          if (finalQuery.length > 2) {
            handleProcessVoiceInput(finalQuery);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
        if (statusText === 'listening') {
          setStatusText('idle');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (statusText === 'listening') {
          setStatusText('idle');
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition init error', e);
      setHasSpeechRecognition(false);
    }

    return () => {
      isComponentMounted.current = false;
      try {
        recognitionRef.current?.abort();
      } catch (e) {}
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Sync thinking status with streaming response
  useEffect(() => {
    if (isStreamingResponse) {
      setStatusText('thinking');
    }
  }, [isStreamingResponse]);

  const startListening = () => {
    if (!hasSpeechRecognition) return;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setTranscript('');
    try {
      recognitionRef.current?.start();
    } catch (e) {
      // If already started, restart
      recognitionRef.current?.stop();
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch (err) {}
      }, 200);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setIsListening(false);
    setStatusText('idle');
  };

  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean markdown, symbols, and suggestions
    const clean = text
      .replace(/\[Suggestions\][\s\S]*$/, '')
      .replace(/[*#`_~]/g, '')
      .replace(/\|.*\|/g, '')
      .replace(/---+/g, '')
      .trim();

    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusText('speaking');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusText('idle');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatusText('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setStatusText('idle');
  };

  const handleProcessVoiceInput = async (spokenText: string) => {
    stopListening();
    setLastUserSpeech(spokenText);
    setStatusText('thinking');

    const result = await onSendMessage(spokenText);
    if (typeof result === 'string' && result.trim()) {
      setLastBotResponse(result);
      speakText(result);
    } else {
      setStatusText('idle');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="glass-panel rounded-3xl max-w-xl w-full border border-white/90 shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 relative">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                FinPulse Voice Mode
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Live Interactive Financial Speech Assistant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-colors"
              title={isMuted ? 'Unmute Audio Voice' : 'Mute Voice'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                stopSpeaking();
                stopListening();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Luminous Audio Orb */}
        <div className="py-10 flex flex-col items-center justify-center relative">
          <div className="relative flex items-center justify-center">
            {/* Ambient Animated Rings */}
            {isListening && (
              <>
                <div className="absolute w-44 h-44 rounded-full bg-emerald-400/20 animate-ping" />
                <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-pulse" />
              </>
            )}

            {isSpeaking && (
              <>
                <div className="absolute w-44 h-44 rounded-full bg-teal-400/20 animate-pulse" />
                <div className="absolute w-36 h-36 rounded-full bg-blue-400/20 animate-ping" />
              </>
            )}

            {/* Core Glowing Orb */}
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl z-10 cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white scale-105 shadow-emerald-500/30 ring-4 ring-emerald-300/40'
                  : isSpeaking
                  ? 'bg-gradient-to-tr from-teal-500 to-indigo-500 text-white shadow-teal-500/30 ring-4 ring-teal-300/40'
                  : statusText === 'thinking'
                  ? 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white animate-pulse'
                  : 'bg-white border-2 border-emerald-500/40 text-emerald-700 hover:border-emerald-600 hover:scale-105 shadow-slate-200/50'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : isSpeaking ? (
                <Volume2 className="w-10 h-10 animate-pulse" />
              ) : statusText === 'thinking' ? (
                <RefreshCw className="w-9 h-9 animate-spin text-emerald-300" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-6 text-center">
            <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider text-slate-700 bg-white/80 border border-white shadow-xs">
              {statusText === 'listening'
                ? 'Listening to you... Speak now'
                : statusText === 'thinking'
                ? 'FinPulse is formulating guidance...'
                : statusText === 'speaking'
                ? 'FinPulse Advisor is speaking'
                : 'Tap microphone to speak'}
            </span>
          </div>

          {/* Live Waveform Indicator */}
          <div className="flex items-center gap-1.5 h-6 mt-4">
            {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9, 0.7].map((delay, idx) => (
              <span
                key={idx}
                style={{
                  animationDelay: `${delay}s`,
                  height: isListening || isSpeaking ? '100%' : '20%',
                }}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isListening
                    ? 'bg-emerald-500 voice-wave-bar'
                    : isSpeaking
                    ? 'bg-teal-500 voice-wave-bar'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Live Audio Transcript Preview */}
        <div className="glass-card rounded-2xl p-4 text-xs space-y-2 mb-4 border border-white/70">
          <div className="flex items-center justify-between text-slate-400 font-medium">
            <span>Live Voice Stream:</span>
            <span className="font-mono text-[11px]">
              Persona: {activeProfile.personaName}
            </span>
          </div>

          {transcript ? (
            <p className="text-slate-900 font-medium italic text-sm">
              "{transcript}"
            </p>
          ) : lastUserSpeech ? (
            <p className="text-slate-700">
              <strong className="text-slate-900 font-semibold">You asked:</strong> "{lastUserSpeech}"
            </p>
          ) : (
            <p className="text-slate-400 italic">
              Try asking: "How should I structure my 50/30/20 budget?", "Should I pay off debt or invest?", or "How much emergency fund do I need?"
            </p>
          )}
        </div>

        {/* Speech Controls & Quick Suggestions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Speed:</span>
            {[1.0, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeechRate(speed)}
                className={`px-2 py-0.5 rounded font-mono font-semibold transition-colors ${
                  speechRate === speed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/60 text-slate-600 hover:bg-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium flex items-center gap-1 hover:bg-amber-100 transition-colors"
              >
                <Square className="w-3 h-3" />
                <span>Stop Speaking</span>
              </button>
            )}

            {!isListening ? (
              <button
                onClick={startListening}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Start Speaking</span>
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Finish Speaking</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
