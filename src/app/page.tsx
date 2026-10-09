'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { CardDeck } from '@/components/CardDeck';
import { QuickAddModal } from '@/components/QuickAddModal';
import { EditModeModal } from '@/components/EditModeModal';
import { MenuDrawer } from '@/components/MenuDrawer';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { sounds } from '@/lib/sound';
import { type Card } from '@/lib/db';

export default function HomePage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [activeBox, setActiveBox] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [practiceAnytime, setPracticeAnytime] = useState(true);

  // Modals & Drawer states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isEditModeOpen, setIsEditModeOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  // Fetch cards and auth state on mount
  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch('/api/cards');
      const data = await res.json();
      if (data.success && Array.isArray(data.cards)) {
        setCards(data.cards);
      }
    } catch (err) {
      console.error('Failed to load cards:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      setIsAuthed(Boolean(data.authenticated));
    } catch {
      setIsAuthed(false);
    }
  }, []);

  useEffect(() => {
    setIsMuted(sounds.getMuted());
    fetchCards();
    checkAuth();
  }, [fetchCards, checkAuth]);

  // Card counts per box
  const boxCounts = useMemo(() => {
    return {
      1: cards.filter((c) => c.box === 1).length,
      2: cards.filter((c) => c.box === 2).length,
      3: cards.filter((c) => c.box === 3).length,
    };
  }, [cards]);

  // Filtered cards for active box
  const activeBoxCards = useMemo(() => {
    return cards.filter((c) => c.box === activeBox);
  }, [cards, activeBox]);

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Review Card Action
  const handleReviewCard = async (
    id: string,
    correct: boolean
  ): Promise<{ graduated?: boolean; demoted?: boolean; newBox?: number }> => {
    const res = await fetch(`/api/cards/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Review submission failed');
    }

    setCards((prev) => prev.map((c) => (c.id === id ? data.card : c)));

    return {
      graduated: data.graduated,
      demoted: data.demoted,
      newBox: data.newBox,
    };
  };

  // Add Card
  const handleAddCard = async (data: {
    question: string;
    answer: string;
    box: number;
  }) => {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.error || 'Failed to add card');
    }

    setCards((prev) => [resData.card, ...prev]);
  };

  // Update Card
  const handleUpdateCard = async (id: string, updates: Partial<Card>) => {
    const res = await fetch(`/api/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update card');
    }

    setCards((prev) => prev.map((c) => (c.id === id ? data.card : c)));
  };

  // Delete Card
  const handleDeleteCard = async (id: string) => {
    const res = await fetch(`/api/cards/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete card');
    }

    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  // Unlock Edit Mode
  const handleUnlock = async (password: string) => {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Incorrect password');
    }

    setIsAuthed(true);
  };

  // Lock Edit Mode
  const handleLock = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthed(false);
    setIsEditModeOpen(false);
  };

  return (
    <div className="app-viewport">
      {/* Unified Header with Integrated 3-Box Segmented Control */}
      <Navbar
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        isEditMode={isAuthed}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeBox={activeBox}
        onSelectBox={setActiveBox}
        boxCounts={boxCounts}
        practiceAnytime={practiceAnytime}
      />

      {/* Main Focus Study Arena */}
      <main className="study-arena">
        {isLoading ? (
          <div className="neo-box text-center max-w-sm mx-auto" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF' }}>
            <div
              className="animate-spin"
              style={{
                width: 28,
                height: 28,
                margin: '0 auto 12px auto',
                border: '2.5px solid #18181B',
                borderTopColor: 'transparent',
                borderRadius: '50%',
              }}
            />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#18181B' }}>
              Loading flashcards...
            </p>
          </div>
        ) : (
          <CardDeck
            cards={activeBoxCards}
            activeBox={activeBox}
            onReviewCard={handleReviewCard}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            practiceAnytime={practiceAnytime}
            onSelectBox={setActiveBox}
            onEnablePracticeAnytime={() => setPracticeAnytime(true)}
          />
        )}
      </main>

      {/* Slide-out Burger Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isAuthed={isAuthed}
        onOpenEditMode={() => setIsEditModeOpen(true)}
        onExitEditMode={handleLock}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        practiceAnytime={practiceAnytime}
        onTogglePracticeAnytime={() => setPracticeAnytime((prev) => !prev)}
        boxCounts={boxCounts}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddCard={handleAddCard}
        defaultBox={activeBox}
      />

      {/* Edit Mode & Flashcard Manager Modal */}
      <EditModeModal
        isOpen={isEditModeOpen}
        onClose={() => setIsEditModeOpen(false)}
        isAuthed={isAuthed}
        onUnlock={handleUnlock}
        onLock={handleLock}
        cards={cards}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onPasswordChanged={() => {}}
      />
    </div>
  );
}
