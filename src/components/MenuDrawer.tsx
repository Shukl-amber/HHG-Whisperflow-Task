'use client';

import React from 'react';
import {
  X,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Calendar,
  Layers,
  HelpCircle,
  Plus,
  Sliders,
  KeyRound,
  Keyboard,
} from 'lucide-react';
import { sounds } from '@/lib/sound';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthed: boolean;
  onOpenEditMode: () => void;
  onExitEditMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  practiceAnytime: boolean;
  onTogglePracticeAnytime: () => void;
  boxCounts: { 1: number; 2: number; 3: number };
  onOpenQuickAdd: () => void;
  onOpenChangePassword?: () => void;
}

export function MenuDrawer({
  isOpen,
  onClose,
  isAuthed,
  onOpenEditMode,
  onExitEditMode,
  isMuted,
  onToggleMute,
  practiceAnytime,
  onTogglePracticeAnytime,
  boxCounts,
  onOpenQuickAdd,
  onOpenChangePassword,
}: MenuDrawerProps) {
  if (!isOpen) return null;

  const totalCards = boxCounts[1] + boxCounts[2] + boxCounts[3];

  return (
    <div
      className="drawer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playPop();
          onClose();
        }
      }}
    >
      <div className="drawer-panel">
        {/* Drawer Header */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingBottom: 16,
            borderBottom: '1px solid rgba(24, 24, 27, 0.15)',
            marginBottom: 20,
          }}
        >
          <div className="flex items-center gap-2-5">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'var(--pastel-yellow)',
                border: '2px solid #18181B',
                boxShadow: '1.5px 1.5px 0 #18181B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders style={{ width: 16, height: 16, color: '#18181B' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#18181B' }}>
                Menu & Settings
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#71717A' }}>
                Leitner 3-Box Repetition
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="neo-icon-btn"
            style={{ width: 32, height: 32 }}
            title="Close menu"
            aria-label="Close menu drawer"
          >
            <X style={{ width: 16, height: 16, color: '#18181B' }} />
          </button>
        </div>

        {/* Section 1: Deck Stats */}
        <div style={{ marginBottom: 20 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#71717A' }}>
              Deck Status
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: '#18181B' }}>
              Total: {totalCards} cards
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div
              className="neo-box text-center"
              style={{ padding: '10px 6px', backgroundColor: 'var(--pastel-yellow-subtle)' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#854D0E' }}>
                BOX 1
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18181B' }}>
                {boxCounts[1]}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#71717A' }}>Daily</div>
            </div>

            <div
              className="neo-box text-center"
              style={{ padding: '10px 6px', backgroundColor: 'var(--pastel-purple-subtle)' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#6B21A8' }}>
                BOX 2
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18181B' }}>
                {boxCounts[2]}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#71717A' }}>Weekly</div>
            </div>

            <div
              className="neo-box text-center"
              style={{ padding: '10px 6px', backgroundColor: 'var(--pastel-green-subtle)' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#15803D' }}>
                BOX 3
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18181B' }}>
                {boxCounts[3]}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#71717A' }}>Monthly</div>
            </div>
          </div>
        </div>

        {/* Section 2: Card Management */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#71717A', marginBottom: 8 }}>
            Card Management
          </div>

          {isAuthed ? (
            <div className="neo-box" style={{ padding: 14 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <span className="flex items-center gap-1" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803D' }}>
                  <Unlock style={{ width: 14, height: 14 }} /> Edit Mode Unlocked
                </span>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#22C55E',
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    sounds.playPop();
                    onClose();
                    onOpenEditMode();
                  }}
                  className="neo-button neo-button-purple w-full justify-start"
                  style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                >
                  <Layers style={{ width: 15, height: 15 }} />
                  <span>Open Flashcard Manager</span>
                </button>

                <div className="flex gap-2">
                  {onOpenChangePassword && (
                    <button
                      onClick={() => {
                        sounds.playPop();
                        onClose();
                        onOpenChangePassword();
                      }}
                      className="neo-button flex-1"
                      style={{ fontSize: '0.78rem', backgroundColor: '#FAF8F5', padding: '7px 10px' }}
                    >
                      <KeyRound style={{ width: 13, height: 13 }} />
                      <span>Password</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      sounds.playPop();
                      onExitEditMode();
                    }}
                    className="neo-button neo-button-danger flex-1"
                    style={{ fontSize: '0.78rem', padding: '7px 10px' }}
                  >
                    <Lock style={{ width: 13, height: 13 }} />
                    <span>Lock</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="neo-box" style={{ padding: 14 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      padding: 6,
                      backgroundColor: 'var(--color-bg-subtle)',
                      border: '1px solid #18181B',
                      borderRadius: 6,
                      display: 'flex',
                    }}
                  >
                    <Lock style={{ width: 14, height: 14, color: '#52525B' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#18181B' }}>
                      Edit Mode (Locked)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#71717A', fontFamily: 'var(--font-mono)' }}>
                      Default: Amber test
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playPop();
                  onClose();
                  onOpenEditMode();
                }}
                className="neo-button neo-button-purple w-full justify-center"
                style={{ fontSize: '0.82rem', padding: '9px 12px' }}
              >
                <Unlock style={{ width: 14, height: 14 }} />
                <span>Unlock Flashcard Manager</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Study Preferences */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#71717A', marginBottom: 8 }}>
            Preferences
          </div>

          {/* Toggle: Practice Anytime */}
          <div
            className="neo-box flex items-center justify-between"
            style={{ padding: 12, marginBottom: 8 }}
          >
            <div className="flex items-center gap-2">
              <Calendar style={{ width: 16, height: 16, color: '#6B21A8', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#18181B' }}>
                  Practice Anytime
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717A' }}>
                  {practiceAnytime ? 'Weekly review allowed any day' : 'Strict Sunday weekly reviews'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                onTogglePracticeAnytime();
              }}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: '2px solid #18181B',
                padding: 2,
                backgroundColor: practiceAnytime ? 'var(--pastel-green)' : '#E4E4E7',
                cursor: 'pointer',
                position: 'relative',
                flexShrink: 0,
              }}
              title="Toggle practice anytime"
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: '#18181B',
                  transform: practiceAnytime ? 'translateX(20px)' : 'translateX(0)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>
          </div>

          {/* Toggle: Sound FX */}
          <div
            className="neo-box flex items-center justify-between"
            style={{ padding: 12 }}
          >
            <div className="flex items-center gap-2">
              {isMuted ? (
                <VolumeX style={{ width: 16, height: 16, color: '#F43F5E', flexShrink: 0 }} />
              ) : (
                <Volume2 style={{ width: 16, height: 16, color: '#15803D', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#18181B' }}>
                  Audio Feedback
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717A' }}>
                  {isMuted ? 'Muted' : 'Retro chimes & audio clicks'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                onToggleMute();
              }}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: '2px solid #18181B',
                padding: 2,
                backgroundColor: !isMuted ? 'var(--pastel-green)' : '#E4E4E7',
                cursor: 'pointer',
                position: 'relative',
                flexShrink: 0,
              }}
              title="Toggle audio"
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: '#18181B',
                  transform: !isMuted ? 'translateX(20px)' : 'translateX(0)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>
          </div>
        </div>

        {/* Section 4: Quick Add Action */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
              onOpenQuickAdd();
            }}
            className="neo-button neo-button-primary w-full justify-center"
            style={{ padding: '10px 14px' }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            <span>Create New Flashcard</span>
          </button>
        </div>

        {/* Section 5: Rules & Shortcuts Guide */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(24, 24, 27, 0.15)' }}>
          <div
            className="neo-box"
            style={{ padding: 12, backgroundColor: 'var(--pastel-purple-subtle)', marginBottom: 10 }}
          >
            <div className="flex items-center gap-1" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B21A8', marginBottom: 6 }}>
              <HelpCircle style={{ width: 14, height: 14 }} />
              <span>How the 3-Box Flow Works:</span>
            </div>
            <ul style={{ fontSize: '0.75rem', color: '#52525B', paddingLeft: 18, lineHeight: 1.5 }}>
              <li>
                <strong style={{ color: '#18181B' }}>Correct (✔):</strong> Promoted to next box (Daily &rarr; Weekly &rarr; Monthly).
              </li>
              <li>
                <strong style={{ color: '#18181B' }}>Wrong (✖):</strong> Drops back to Box 1 for daily reinforcement.
              </li>
              <li>
                <strong style={{ color: '#18181B' }}>Box 3:</strong> Crystallized monthly memory vault.
              </li>
            </ul>
          </div>

          <div
            className="flex items-center justify-between"
            style={{
              padding: '8px 12px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #18181B',
              borderRadius: 8,
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: '#71717A',
            }}
          >
            <span className="flex items-center gap-1">
              <Keyboard style={{ width: 13, height: 13, color: '#18181B' }} /> Shortcuts:
            </span>
            <span>
              <kbd>Space</kbd> Flip &bull; <kbd>1</kbd> Wrong &bull; <kbd>2</kbd> Got It
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
