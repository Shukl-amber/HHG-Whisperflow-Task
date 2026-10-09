'use client';

import React from 'react';
import { Sun, Calendar, Trophy } from 'lucide-react';
import { sounds } from '@/lib/sound';

interface BoxSelectorProps {
  activeBox: number;
  onSelectBox: (box: number) => void;
  boxCounts: { 1: number; 2: number; 3: number };
  practiceAnytime: boolean;
}

export function BoxSelector({
  activeBox,
  onSelectBox,
  boxCounts,
  practiceAnytime,
}: BoxSelectorProps) {
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
            <span className="box-tab-badge" style={b.badgeStyle}>
              {b.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
