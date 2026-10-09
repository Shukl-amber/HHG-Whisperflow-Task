'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Edit3,
  Plus,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react';
import { type Card } from '@/lib/db';
import { sounds } from '@/lib/sound';
import { ChangePasswordModal } from './ChangePasswordModal';

interface EditModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthed: boolean;
  onUnlock: (password: string) => Promise<void>;
  onLock: () => Promise<void>;
  cards: Card[];
  onUpdateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
  onOpenQuickAdd: () => void;
}

export function EditModeModal({
  isOpen,
  onClose,
  isAuthed,
  onUnlock,
  onLock,
  cards,
  onUpdateCard,
  onDeleteCard,
  onOpenQuickAdd,
}: EditModeModalProps) {
  // Password prompt state
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Card management state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBox, setFilterBox] = useState<number | 'all'>('all');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editBox, setEditBox] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Change password modal
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Filtered cards list
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch =
        card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBox = filterBox === 'all' || card.box === filterBox;
      return matchesSearch && matchesBox;
    });
  }, [cards, searchQuery, filterBox]);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    try {
      await onUnlock(password);
      sounds.playSuccess();
      setPassword('');
    } catch (err: unknown) {
      sounds.playFailure();
      setAuthError(err instanceof Error ? err.message : 'Incorrect password');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartEdit = (card: Card) => {
    sounds.playPop();
    setEditingCardId(card.id);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
    setEditBox(card.box);
  };

  const handleSaveCard = async (id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    setIsSaving(true);
    try {
      await onUpdateCard(id, {
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
        box: editBox,
      });
      sounds.playSuccess();
      setEditingCardId(null);
    } catch (err: unknown) {
      sounds.playFailure();
      alert(err instanceof Error ? err.message : 'Failed to update card');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickBoxChange = async (id: string, newBox: number) => {
    sounds.playPop();
    try {
      await onUpdateCard(id, { box: newBox });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update box');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteCard(id);
      sounds.playPop();
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete card');
    }
  };

  return (
    <>
      <div
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-content" style={{ maxWidth: 640 }}>
          {/* Close Modal button */}
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="neo-icon-btn"
            style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32 }}
            title="Close"
          >
            <X style={{ width: 16, height: 16, color: '#18181B' }} />
          </button>

          {!isAuthed ? (
            /* ================= PASSWORD PROMPT VIEW ================= */
            <div style={{ padding: '8px 4px', maxWidth: 360, margin: '0 auto', textAlign: 'center' }}>
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
                <Lock style={{ width: 22, height: 22, color: '#581C87' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18181B', marginBottom: 4 }}>
                Unlock Edit Mode
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#52525B', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
                Manage flashcards and box frequencies
              </p>

              {authError && (
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    textAlign: 'left',
                  }}
                >
                  <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: '#18181B', marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="neo-input"
                    autoFocus
                    required
                  />
                  <p style={{ fontSize: '0.72rem', color: '#71717A', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                    Default password is{' '}
                    <code style={{ backgroundColor: '#FEF08A', padding: '2px 6px', border: '1px solid #18181B', borderRadius: 4, color: '#18181B', fontWeight: 700 }}>
                      Amber test
                    </code>
                  </p>
                </div>

                <div className="flex justify-end gap-2">
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
                    disabled={isVerifying}
                    className="neo-button neo-button-sm neo-button-purple"
                  >
                    <Unlock style={{ width: 14, height: 14 }} />
                    <span>{isVerifying ? 'Checking...' : 'Unlock'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ================= UNLOCKED CARD MANAGER VIEW ================= */
            <div>
              {/* Header */}
              <div
                className="flex items-center justify-between"
                style={{
                  borderBottom: '1px solid rgba(24, 24, 27, 0.15)',
                  paddingBottom: 14,
                  marginBottom: 16,
                  paddingRight: 36,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      padding: 6,
                      backgroundColor: '#BBF7D0',
                      border: '2px solid #18181B',
                      borderRadius: 8,
                      boxShadow: '1.5px 1.5px 0 #18181B',
                      display: 'flex',
                    }}
                  >
                    <Unlock style={{ width: 16, height: 16, color: '#14532D' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#18181B' }}>
                      Flashcard Manager
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: '#52525B', fontFamily: 'var(--font-mono)' }}>
                      Edit questions, alter box frequencies, or delete
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="neo-button neo-button-sm"
                    style={{ backgroundColor: '#FAF8F5' }}
                    title="Change edit mode password"
                  >
                    <KeyRound style={{ width: 13, height: 13 }} />
                    <span>Password</span>
                  </button>
                  <button
                    onClick={async () => {
                      sounds.playPop();
                      await onLock();
                    }}
                    className="neo-button neo-button-sm neo-button-danger"
                    title="Lock edit mode"
                  >
                    <Lock style={{ width: 13, height: 13 }} />
                    <span>Lock</span>
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div
                className="flex items-center justify-between"
                style={{ gap: 10, marginBottom: 14, flexWrap: 'wrap' }}
              >
                <div style={{ position: 'relative', width: 220, flexGrow: 1 }}>
                  <Search
                    style={{
                      width: 14,
                      height: 14,
                      color: '#71717A',
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cards..."
                    className="neo-input"
                    style={{ paddingLeft: 32, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: '0.78rem' }}
                  />
                </div>

                <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
                  {(['all', 1, 2, 3] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        sounds.playPop();
                        setFilterBox(b);
                      }}
                      className="neo-button neo-button-sm"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        backgroundColor:
                          filterBox === b
                            ? b === 1
                              ? 'var(--pastel-yellow)'
                              : b === 2
                              ? 'var(--pastel-purple)'
                              : b === 3
                              ? 'var(--pastel-green)'
                              : '#18181B'
                            : '#FFFFFF',
                        color: filterBox === b && b === 'all' ? '#FFFFFF' : '#18181B',
                      }}
                    >
                      {b === 'all'
                        ? `All (${cards.length})`
                        : b === 1
                        ? `Daily (${cards.filter((c) => c.box === 1).length})`
                        : b === 2
                        ? `Weekly (${cards.filter((c) => c.box === 2).length})`
                        : `Monthly (${cards.filter((c) => c.box === 3).length})`}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      sounds.playPop();
                      onOpenQuickAdd();
                    }}
                    className="neo-button neo-button-sm neo-button-primary"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  >
                    <Plus style={{ width: 13, height: 13 }} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Cards List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  paddingRight: 4,
                }}
              >
                {filteredCards.length === 0 ? (
                  <div
                    className="neo-box text-center"
                    style={{ padding: 24, backgroundColor: '#FAF8FF', fontSize: '0.78rem', color: '#52525B', fontFamily: 'var(--font-mono)' }}
                  >
                    No flashcards match query or filter.
                  </div>
                ) : (
                  filteredCards.map((card) => {
                    const isEditing = editingCardId === card.id;
                    const isConfirmingDelete = deleteConfirmId === card.id;

                    if (isEditing) {
                      return (
                        <div
                          key={card.id}
                          className="neo-box"
                          style={{ padding: 14, backgroundColor: '#FFFBEB', display: 'flex', flexDirection: 'column', gap: 10 }}
                        >
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: '#18181B', marginBottom: 4 }}>
                              Question / Front
                            </label>
                            <textarea
                              rows={2}
                              value={editQuestion}
                              onChange={(e) => setEditQuestion(e.target.value)}
                              className="neo-textarea"
                              style={{ fontSize: '0.8rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: '#18181B', marginBottom: 4 }}>
                              Answer / Back
                            </label>
                            <textarea
                              rows={2}
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              className="neo-textarea"
                              style={{ fontSize: '0.8rem' }}
                            />
                          </div>
                          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 8 }}>
                            <div className="flex items-center gap-1-5">
                              <label style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#18181B' }}>
                                Frequency:
                              </label>
                              <select
                                value={editBox}
                                onChange={(e) => setEditBox(Number(e.target.value))}
                                className="neo-select"
                                style={{ fontSize: '0.75rem', padding: '4px 8px', width: 140 }}
                              >
                                <option value={1}>Box 1 (Daily)</option>
                                <option value={2}>Box 2 (Weekly)</option>
                                <option value={3}>Box 3 (Monthly)</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1-5">
                              <button
                                onClick={() => setEditingCardId(null)}
                                className="neo-button neo-button-sm"
                                style={{ backgroundColor: '#FFFFFF' }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveCard(card.id)}
                                disabled={isSaving}
                                className="neo-button neo-button-sm neo-button-primary"
                              >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={card.id}
                        className="neo-box flex items-center justify-between"
                        style={{ padding: 12, gap: 12 }}
                      >
                        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                          <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#18181B', marginBottom: 2 }}>
                            {card.question}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#52525B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {card.answer}
                          </p>
                          <div style={{ marginTop: 4 }}>
                            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#71717A' }}>
                              Streak: {card.streak} &bull; Reviews: {card.review_count}
                            </span>
                          </div>
                        </div>

                        {/* Frequency Dropdown & Action Controls */}
                        <div className="flex items-center gap-1-5" style={{ flexShrink: 0 }}>
                          <select
                            value={card.box}
                            onChange={(e) =>
                              handleQuickBoxChange(card.id, Number(e.target.value))
                            }
                            className="neo-select"
                            style={{
                              fontSize: '0.72rem',
                              padding: '4px 6px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              width: 100,
                              backgroundColor:
                                card.box === 1
                                  ? 'var(--pastel-yellow)'
                                  : card.box === 2
                                  ? 'var(--pastel-purple)'
                                  : 'var(--pastel-green)',
                            }}
                            title="Alter card frequency/box"
                          >
                            <option value={1}>Box 1 (Daily)</option>
                            <option value={2}>Box 2 (Weekly)</option>
                            <option value={3}>Box 3 (Monthly)</option>
                          </select>

                          <button
                            onClick={() => handleStartEdit(card)}
                            className="neo-icon-btn"
                            style={{ width: 28, height: 28 }}
                            title="Edit card"
                          >
                            <Edit3 style={{ width: 14, height: 14, color: '#18181B' }} />
                          </button>

                          {isConfirmingDelete ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: '#FECDD3',
                                padding: 2,
                                borderRadius: 6,
                                border: '1.5px solid #18181B',
                              }}
                            >
                              <button
                                onClick={() => handleDelete(card.id)}
                                style={{
                                  padding: '2px 6px',
                                  backgroundColor: '#F43F5E',
                                  color: '#FFFFFF',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  borderRadius: 4,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                style={{
                                  padding: '2px 4px',
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(card.id)}
                              className="neo-icon-btn"
                              style={{ width: 28, height: 28 }}
                              title="Delete card"
                            >
                              <Trash2 style={{ width: 14, height: 14, color: '#F43F5E' }} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onPasswordChanged={() => {}}
      />
    </>
  );
}
