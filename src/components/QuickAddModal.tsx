'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { sounds } from '@/lib/sound';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (data: { question: string; answer: string; box: number }) => Promise<void>;
  defaultBox?: number;
}

export function QuickAddModal({
  isOpen,
  onClose,
  onAddCard,
  defaultBox = 1,
}: QuickAddModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [box, setBox] = useState(defaultBox);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questionInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBox(defaultBox);
      setQuestion('');
      setAnswer('');
      setError(null);
      setTimeout(() => questionInputRef.current?.focus(), 80);
    }
  }, [isOpen, defaultBox]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, question, answer, box]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) {
      setError('Please provide a prompt or question.');
      return;
    }
    if (!answer.trim()) {
      setError('Please provide the answer to recall.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddCard({
        question: question.trim(),
        answer: answer.trim(),
        box,
      });
      sounds.playSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add card';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content" style={{ maxWidth: 480 }}>
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="neo-icon-btn"
          style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32 }}
          title="Close (Esc)"
        >
          <X style={{ width: 16, height: 16, color: '#18181B' }} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div
            style={{
              width: 36,
              height: 36,
              backgroundColor: 'var(--pastel-yellow)',
              border: '2px solid #18181B',
              borderRadius: 10,
              boxShadow: '1.5px 1.5px 0 #18181B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus style={{ width: 18, height: 18, color: '#18181B' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#18181B' }}>
              New Flashcard
            </h3>
            <p style={{ fontSize: '0.72rem', color: '#52525B', fontFamily: 'var(--font-mono)' }}>
              Add directly to Leitner learning flow
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 14,
              padding: '8px 12px',
              backgroundColor: '#FECDD3',
              border: '2px solid #18181B',
              borderRadius: 8,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#9F1239',
              boxShadow: '1.5px 1.5px 0 #18181B',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Question / Front */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: '#18181B', marginBottom: 5 }}>
              Card Front (Question / Prompt)
            </label>
            <textarea
              ref={questionInputRef}
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the spacing effect in memory retention?"
              className="neo-textarea"
              required
            />
          </div>

          {/* Answer / Back */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: '#18181B', marginBottom: 5 }}>
              Card Back (Answer / Solution)
            </label>
            <textarea
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g. Learning is far more durable when study sessions are spaced out over intervals over time."
              className="neo-textarea"
              required
            />
          </div>

          {/* Initial Box Frequency */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: '#18181B', marginBottom: 5 }}>
              Initial Box
            </label>
            <select
              value={box}
              onChange={(e) => setBox(Number(e.target.value))}
              className="neo-select"
            >
              <option value={1}>Box 1 &bull; Daily (Standard starting box)</option>
              <option value={2}>Box 2 &bull; Weekly (Sundays)</option>
              <option value={3}>Box 3 &bull; Monthly (Mastery)</option>
            </select>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              paddingTop: 6,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#71717A', fontFamily: 'var(--font-mono)' }}>
              <kbd>Ctrl+Enter</kbd> to save
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={onClose}
                className="neo-button neo-button-sm"
                style={{ backgroundColor: '#FAF8F5' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="neo-button neo-button-sm neo-button-primary"
              >
                {isSubmitting ? 'Saving...' : 'Create Card'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
