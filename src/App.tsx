import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ChatAdvisor } from './components/ChatAdvisor';
import { VoiceModeModal } from './components/VoiceModeModal';
import { BudgetPlanner } from './components/BudgetPlanner';
import { LoanCalculator } from './components/LoanCalculator';
import { InvestmentProjector } from './components/InvestmentProjector';
import { ProjectReportView } from './components/ProjectReportView';
import { FinancialAuditModal } from './components/FinancialAuditModal';
import { PersonaModal } from './components/PersonaModal';
import { FinancialProfile, SAMPLE_PROFILES } from './types/financial';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  // Load saved profile or default to first sample persona
  const [activeProfile, setActiveProfile] = useState<FinancialProfile>(() => {
    try {
      const saved = localStorage.getItem('finpulse_active_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Fallback
    }
    return SAMPLE_PROFILES[0];
  });

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [pendingChatMessage, setPendingChatMessage] = useState<string | null>(null);
  const [isVoiceStreaming, setIsVoiceStreaming] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('finpulse_active_profile', JSON.stringify(activeProfile));
    } catch (e) {
      console.warn('Could not persist profile to localStorage', e);
    }
  }, [activeProfile]);

  const handleUpdateProfile = (updated: Partial<FinancialProfile>) => {
    setActiveProfile((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleSendToChat = (message: string) => {
    setPendingChatMessage(message);
    setActiveTab('chat');
  };

  // Handler for Voice Mode audio conversation
  const handleVoiceSendMessage = async (spokenText: string): Promise<string> => {
    setIsVoiceStreaming(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: spokenText }],
          userProfile: activeProfile,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No stream body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulated += parsed.text;
              }
            } catch (err) {}
          }
        }
      }

      return accumulated;
    } catch (error) {
      console.error('Voice send error:', error);
      return `I received your question about ${spokenText}, but encountered a temporary connection issue. Please check your network or try again.`;
    } finally {
      setIsVoiceStreaming(false);
    }
  };

  return (
    <div className="min-h-screen light-glass-canvas text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProfile={activeProfile}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenProfileModal={() => setIsPersonaModalOpen(true)}
        onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatAdvisor
            activeProfile={activeProfile}
            initialMessageToSend={pendingChatMessage ?? undefined}
            onClearInitialMessage={() => setPendingChatMessage(null)}
            onSwitchTab={(tab) => setActiveTab(tab)}
            onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPlanner
            activeProfile={activeProfile}
            onUpdateProfile={handleUpdateProfile}
            onSendToChat={handleSendToChat}
          />
        )}

        {activeTab === 'loan' && (
          <LoanCalculator
            activeProfile={activeProfile}
            onSendToChat={handleSendToChat}
          />
        )}

        {activeTab === 'invest' && (
          <InvestmentProjector
            activeProfile={activeProfile}
            onSendToChat={handleSendToChat}
          />
        )}

        {activeTab === 'report' && (
          <ProjectReportView
            onStartDemoTour={() => {
              setActiveTab('chat');
            }}
          />
        )}
      </main>

      {/* Voice Mode Modal */}
      <VoiceModeModal
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        activeProfile={activeProfile}
        onSendMessage={handleVoiceSendMessage}
        isStreamingResponse={isVoiceStreaming}
      />

      {/* Financial Health Audit Modal */}
      <FinancialAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        activeProfile={activeProfile}
        onDiscussInChat={(prompt) => {
          setPendingChatMessage(prompt);
          setActiveTab('chat');
        }}
      />

      {/* Sample Persona Switcher Modal */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        activeProfile={activeProfile}
        onSelectProfile={(profile) => setActiveProfile(profile)}
      />
    </div>
  );
}
