'use client';

import React from 'react';
import {
  Sparkles,
  Plus,
  Volume2,
  VolumeX,
  Menu,
  Sun,
  Calendar,
  Trophy,
} from 'lucide-react';
import { sounds } from '@/lib/sound';

interface NavbarProps {
  onOpenMenu: () => void;
  onOpenQuickAdd: () => void;
  isEditMode: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  activeBox: number;
  onSelectBox: (box: number) => void;
  boxCounts: { 1: number; 2: number; 3: number };
  practiceAnytime: boolean;
}

export function Navbar({
  onOpenMenu,
  onOpenQuickAdd,
  isEditMode,
  isMuted,
  onToggleMute,
  activeBox,
  onSelectBox,
  boxCounts,
  practiceAnytime,
}: NavbarProps) {
  const today = new Date();
  const isSunday = today.getDay() === 0;

  const boxes = [
    {
      id: 1,
      title: 'Box 1',
      schedule: 'Daily',
      count: boxCounts[1],
      icon: Sun,
      tabClass: 'box-tab-1',
      badgeStyle: { backgroundColor: '#FEF9C3', color: '#854D0E' },
    },
    {
      id: 2,
      title: 'Box 2',
      schedule: 'Weekly',
      count: boxCounts[2],
      icon: Calendar,
      tabClass: 'box-tab-2',
      badgeStyle: isSunday
        ? { backgroundColor: '#BBF7D0', color: '#14532D' }
        : { backgroundColor: '#F3E8FF', color: '#6B21A8' },
    },
    {
      id: 3,
      title: 'Box 3',
      schedule: 'Monthly',
      count: boxCounts[3],
      icon: Trophy,
      tabClass: 'box-tab-3',
      badgeStyle: { backgroundColor: '#DCFCE7', color: '#15803D' },
    },
  ];

  return (
    <header className="app-header">
      {/* Top Bar: Brand Logo & Navigation Controls */}
      <div className="header-top-bar">
        {/* Brand Group */}
        <div className="brand-group">
          <div className="brand-icon-box">
            <Sparkles style={{ width: 18, height: 18, color: '#18181B' }} />
          </div>
          <div className="flex items-baseline gap-1-5">
            <span className="brand-title">LEITNER</span>
            <span className="brand-badge">3-Box Flow</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions-group">
          {/* Quick Add Flashcard Button */}
          <button
            onClick={() => {
              sounds.playPop();
              onOpenQuickAdd();
            }}
            className="neo-button neo-button-primary neo-button-sm"
            title="Create new flashcard"
          >
            <Plus style={{ width: 14, height: 14 }} />
            <span>New Card</span>
          </button>

          {/* Audio Feedback Toggle */}
          <button
            onClick={onToggleMute}
            className="neo-icon-btn"
            style={{ width: 34, height: 34 }}
            title={isMuted ? 'Audio muted (click to enable)' : 'Audio active (click to mute)'}
            aria-label="Toggle sound feedback"
          >
            {isMuted ? (
              <VolumeX style={{ width: 16, height: 16, color: '#F43F5E' }} />
            ) : (
              <Volume2 style={{ width: 16, height: 16, color: '#15803D' }} />
            )}
          </button>

          {/* Menu Drawer Trigger */}
          <button
            onClick={() => {
              sounds.playPop();
              onOpenMenu();
            }}
            className="neo-icon-btn relative"
            style={{ width: 34, height: 34 }}
            title="Open menu & settings"
            aria-label="Open menu drawer"
          >
            <Menu style={{ width: 16, height: 16, color: '#18181B' }} />
            {isEditMode && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 9,
                  height: 9,
                  backgroundColor: '#22C55E',
                  border: '1.5px solid #18181B',
                  borderRadius: '50%',
                }}
                title="Edit mode active"
              />
            )}
          </button>
        </div>
      </div>

      {/* Integrated 3-Box Segmented Control */}
      <div className="header-sub-bar">
        <div className="header-sub-bar-inner">
          <nav role="tablist" aria-label="Leitner Boxes" className="box-nav-container">
            {boxes.map((b) => {
              const isActive = activeBox === b.id;
              const Icon = b.icon;

              return (
                <button
                  key={b.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    sounds.playPop();
                    onSelectBox(b.id);
                  }}
                  className={`box-tab-button ${isActive ? `active ${b.tabClass}` : ''}`}
                >
                  <Icon
                    style={{
                      width: 15,
                      height: 15,
                      flexShrink: 0,
                      color: isActive ? '#18181B' : '#71717A',
                    }}
                  />
                  <span className="box-tab-title">{b.title}</span>
                  <span className="box-tab-subtitle">({b.schedule})</span>
                  <span
                    className="box-tab-badge"
                    style={b.badgeStyle}
                  >
                    {b.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
