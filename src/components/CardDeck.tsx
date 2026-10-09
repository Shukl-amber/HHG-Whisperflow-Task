'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  X,
  RotateCw,
  Sparkles,
  Flame,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
} from 'lucide-react';
import { type Card } from '@/lib/db';
import { sounds } from '@/lib/sound';

interface CardDeckProps {
  cards: Card[];
  activeBox: number;
  onReviewCard: (
    id: string,
    correct: boolean
  ) => Promise<{ graduated?: boolean; demoted?: boolean; newBox?: number }>;
  onOpenQuickAdd: () => void;
  practiceAnytime: boolean;
  onSelectBox: (box: number) => void;
  onEnablePracticeAnytime?: () => void;
}

export function CardDeck({
  cards,
  activeBox,
  onReviewCard,
  onOpenQuickAdd,
  practiceAnytime,
  onSelectBox,
  onEnablePracticeAnytime,
}: CardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{
    text: string;
    type: 'success' | 'danger';
  } | null>(null);

  const today = new Date();
  const isSunday = today.getDay() === 0;
  const isBox2Locked = activeBox === 2 && !isSunday && !practiceAnytime;

  // Reset indices and flip state on box switch
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setFeedbackNotice(null);
  }, [activeBox]);

  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    if (isSubmitting) return;
    sounds.playFlip();
    setIsFlipped((prev) => !prev);
  }, [isSubmitting]);

  const handleNext = useCallback(() => {
    if (cards.length === 0) return;
    sounds.playPop();
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
    setIsFlipped(false);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    if (cards.length === 0) return;
    sounds.playPop();
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
    setIsFlipped(false);
  }, [cards.length]);

  const handleAnswer = useCallback(
    async (correct: boolean) => {
      if (!currentCard || isSubmitting) return;
      setIsSubmitting(true);

      if (correct) {
        sounds.playSuccess();
      } else {
        sounds.playFailure();
      }

      try {
        const result = await onReviewCard(currentCard.id, correct);

        if (correct) {
          if (result.graduated) {
            sounds.playBoxUpgrade();
            confetti({
              particleCount: 55,
              spread: 65,
              origin: { y: 0.7 },
              colors: ['#FEF08A', '#E9D5FF', '#BBF7D0', '#18181B'],
            });
            const nextBoxName =
              result.newBox === 2 ? 'Box 2 (Weekly)' : 'Box 3 (Monthly)';
            setFeedbackNotice({
              text: `Promoted to ${nextBoxName}! 🎉`,
              type: 'success',
            });
          } else {
            setFeedbackNotice({
              text: 'Mastery confirmed in Box 3! ⭐',
              type: 'success',
            });
          }
        } else {
          setFeedbackNotice({
            text:
              currentCard.box > 1
                ? 'Returned to Box 1 (Daily) for reinforcement'
                : 'Retained in Box 1 for daily review',
            type: 'danger',
          });
        }

        setTimeout(() => {
          setIsFlipped(false);
          setFeedbackNotice(null);
          if (currentIndex >= cards.length - 1) {
            setCurrentIndex(0);
          }
          setIsSubmitting(false);
        }, 360);
      } catch {
        setIsSubmitting(false);
      }
    },
    [currentCard, isSubmitting, onReviewCard, currentIndex, cards.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['input', 'textarea', 'select'].includes(
          (e.target as HTMLElement).tagName?.toLowerCase() || ''
        )
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        // Blur any focused button so the browser doesn't execute a duplicate click
        if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        handleFlip();
      } else if (e.key === 'ArrowLeft') {
        if (isFlipped) {
          e.preventDefault();
          handleAnswer(false);
        } else {
          e.preventDefault();
          handlePrev();
        }
      } else if (e.key === 'ArrowRight') {
        if (isFlipped) {
          e.preventDefault();
          handleAnswer(true);
        } else {
          e.preventDefault();
          handleNext();
        }
      } else if (isFlipped && (e.key === '1' || e.key === 'x')) {
        e.preventDefault();
        handleAnswer(false);
      } else if (isFlipped && (e.key === '2' || e.key === 'c')) {
        e.preventDefault();
        handleAnswer(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleAnswer, handleNext, handlePrev, isFlipped]);

  // Locked State for Box 2 when not Sunday and Practice Anytime is off
  if (isBox2Locked) {
    const daysUntilSunday = (7 - today.getDay()) % 7;
    return (
      <div className="neo-box text-center max-w-md mx-auto" style={{ padding: '32px 24px', backgroundColor: '#FAF5FF' }}>
        <div
          style={{
            width: 48,
            height: 48,
            margin: '0 auto 12px auto',
            backgroundColor: '#E9D5FF',
            border: '2px solid #18181B',
            borderRadius: 12,
            boxShadow: '2px 2px 0 #18181B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Calendar style={{ width: 24, height: 24, color: '#581C87' }} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: '#18181B' }}>
          Box 2 Weekly Reviews
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#52525B', maxWidth: 320, margin: '0 auto 20px auto', lineHeight: 1.5 }}>
          Weekly reviews occur every Sunday ({daysUntilSunday || 7}{' '}
          {daysUntilSunday === 1 ? 'day' : 'days'} remaining). You can switch to
          Box 1 or enable anytime practice in the menu.
        </p>
        <div className="flex justify-center gap-2" style={{ flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              sounds.playPop();
              onSelectBox(1);
            }}
            className="neo-button neo-button-primary"
          >
            Study Box 1 (Daily)
          </button>
          {onEnablePracticeAnytime && (
            <button
              onClick={() => {
                sounds.playPop();
                onEnablePracticeAnytime();
              }}
              className="neo-button neo-button-purple"
            >
              Practice Anytime
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty Box State
  if (!cards || cards.length === 0) {
    return (
      <div className="neo-box text-center max-w-md mx-auto" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF' }}>
        <div
          style={{
            width: 48,
            height: 48,
            margin: '0 auto 12px auto',
            backgroundColor: '#FEF08A',
            border: '2px solid #18181B',
            borderRadius: 12,
            boxShadow: '2px 2px 0 #18181B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles style={{ width: 24, height: 24, color: '#18181B' }} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: '#18181B' }}>
          {activeBox === 1
            ? 'Box 1 is Empty'
            : activeBox === 2
            ? 'No Cards in Box 2'
            : 'Box 3 Vault Empty'}
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#52525B', maxWidth: 320, margin: '0 auto 20px auto', lineHeight: 1.5 }}>
          {activeBox === 1
            ? 'All daily flashcards completed! Create new flashcards to keep practicing.'
            : activeBox === 2
            ? 'Cards answered correctly in Box 1 will graduate here for weekly review.'
            : 'Cards answered correctly in Box 2 will reach Box 3 for long-term mastery.'}
        </p>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => {
              sounds.playPop();
              onOpenQuickAdd();
            }}
            className="neo-button neo-button-primary"
          >
            <Plus style={{ width: 14, height: 14 }} />
            <span>Add New Card</span>
          </button>
          {activeBox !== 1 && (
            <button
              onClick={() => {
                sounds.playPop();
                onSelectBox(1);
              }}
              className="neo-button"
            >
              Go to Box 1
            </button>
          )}
        </div>
      </div>
    );
  }

  const boxLabel =
    activeBox === 1
      ? 'Box 1 • Daily'
      : activeBox === 2
      ? 'Box 2 • Weekly'
      : 'Box 3 • Monthly';

  const boxBadgeBg =
    activeBox === 1
      ? '#FEF08A'
      : activeBox === 2
      ? '#E9D5FF'
      : '#BBF7D0';

  const boxBadgeColor =
    activeBox === 1
      ? '#854D0E'
      : activeBox === 2
      ? '#6B21A8'
      : '#15803D';

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Session Progress Header Bar */}
      <div className="session-status-bar">
        <div className="flex items-center gap-2">
          <span
            className="neo-badge"
            style={{ backgroundColor: boxBadgeBg, color: boxBadgeColor }}
          >
            {boxLabel}
          </span>
          <span style={{ color: '#71717A' }}>
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentCard.streak > 0 && (
            <span
              className="neo-badge"
              style={{ backgroundColor: '#FED7AA', color: '#9A3412' }}
            >
              <Flame style={{ width: 12, height: 12, color: '#EA580C' }} /> {currentCard.streak}
            </span>
          )}
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${((currentIndex + 1) / cards.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Notice */}
      {feedbackNotice && (
        <div
          className="animate-fade-in"
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            borderRadius: 8,
            border: '2px solid #18181B',
            fontWeight: 700,
            textAlign: 'center',
            fontSize: '0.78rem',
            backgroundColor: feedbackNotice.type === 'success' ? '#BBF7D0' : '#FECDD3',
            color: feedbackNotice.type === 'success' ? '#14532D' : '#9F1239',
          }}
        >
          {feedbackNotice.text}
        </div>
      )}

      {/* 3D Flippable Flashcard Arena */}
      <div className="card-perspective-container">
        <div
          className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
          aria-label="Flashcard. Click or press Space to reveal answer."
        >
          {/* ================= FRONT FACE (Question) ================= */}
          <div className="flashcard-face flashcard-front">
            {/* Top Bar */}
            <div className="flashcard-top">
              <span className="neo-badge" style={{ backgroundColor: '#FEF08A', color: '#18181B' }}>
                QUESTION
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#71717A' }}>
                {currentCard.review_count}{' '}
                {currentCard.review_count === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            {/* Body */}
            <div className="flashcard-body">
              <p className="question-text">
                {currentCard.question}
              </p>
            </div>

            {/* Bottom Bar */}
            <div className="flashcard-bottom">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    handlePrev();
                  }}
                  className="neo-icon-btn"
                  style={{ width: 32, height: 32 }}
                  title="Previous card"
                >
                  <ChevronLeft style={{ width: 16, height: 16, color: '#18181B' }} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    handleNext();
                  }}
                  className="neo-icon-btn"
                  style={{ width: 32, height: 32 }}
                  title="Next card"
                >
                  <ChevronRight style={{ width: 16, height: 16, color: '#18181B' }} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#71717A' }}>
                  [Space] to flip
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    handleFlip();
                  }}
                  className="neo-button neo-button-sm"
                  style={{ backgroundColor: '#FAF8F5' }}
                >
                  <RotateCw style={{ width: 14, height: 14, color: '#18181B' }} />
                  <span>Reveal Answer</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= BACK FACE (Answer & Evaluation) ================= */}
          <div className="flashcard-face flashcard-back">
            {/* Top Bar */}
            <div className="flashcard-top">
              <span className="neo-badge" style={{ backgroundColor: '#E9D5FF', color: '#18181B' }}>
                ANSWER
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#71717A' }}>
                Self Assessment
              </span>
            </div>

            {/* Body */}
            <div className="flashcard-body">
              <p className="answer-text">
                {currentCard.answer}
              </p>
            </div>

            {/* Bottom Bar: Assessment Buttons */}
            <div className="flashcard-bottom" style={{ display: 'block' }}>
              <div className="grid grid-cols-2 gap-3 w-full">
                {/* WRONG ACTION */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    handleAnswer(false);
                  }}
                  className="neo-button neo-button-danger"
                  style={{ padding: '10px 14px', width: '100%', fontSize: '0.9rem' }}
                  title="Wrong / Forgot (Returns to Box 1) - Key: 1"
                >
                  <X style={{ width: 16, height: 16 }} />
                  <span>
                    Wrong <kbd style={{ marginLeft: 4 }}>1</kbd>
                  </span>
                </button>

                {/* CORRECT ACTION */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.blur();
                    handleAnswer(true);
                  }}
                  className="neo-button neo-button-success"
                  style={{ padding: '10px 14px', width: '100%', fontSize: '0.9rem' }}
                  title="Correct / Remembered (Advances forward) - Key: 2"
                >
                  <Check style={{ width: 16, height: 16 }} />
                  <span>
                    Got It <kbd style={{ marginLeft: 4 }}>2</kbd>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Shortcuts Footer */}
      <div className="shortcuts-footer">
        Shortcuts: <kbd>Space</kbd> Flip &bull; <kbd>1</kbd> Wrong &bull; <kbd>2</kbd> Got It
      </div>
    </div>
  );
}
