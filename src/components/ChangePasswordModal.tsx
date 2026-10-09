'use client';

import React, { useState } from 'react';
import { X, KeyRound, Check, AlertCircle } from 'lucide-react';
import { sounds } from '@/lib/sound';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onPasswordChanged,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password');
      }

      sounds.playSuccess();
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        onPasswordChanged();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      sounds.playFailure();
      setError(err instanceof Error ? err.message : 'An error occurred');
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
      <div className="modal-content" style={{ maxWidth: 380 }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div
            style={{
              width: 36,
              height: 36,
              backgroundColor: 'var(--pastel-purple)',
              border: '2px solid #18181B',
              borderRadius: 10,
              boxShadow: '1.5px 1.5px 0 #18181B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <KeyRound style={{ width: 18, height: 18, color: '#581C87' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#18181B' }}>
              Change Password
            </h3>
            <p style={{ fontSize: '0.72rem', color: '#52525B', fontFamily: 'var(--font-mono)' }}>
              Update password from &quot;Amber test&quot;
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: '8px 12px',
              backgroundColor: '#FECDD3',
              border: '2px solid #18181B',
              borderRadius: 8,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#9F1239',
              boxShadow: '1.5px 1.5px 0 #18181B',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: 12,
              padding: '8px 12px',
              backgroundColor: '#BBF7D0',
              border: '2px solid #18181B',
              borderRadius: 8,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#14532D',
              boxShadow: '1.5px 1.5px 0 #18181B',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Check style={{ width: 15, height: 15, flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: '#18181B', marginBottom: 5 }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="e.g. Amber test"
              className="neo-input"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: '#18181B', marginBottom: 5 }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="neo-input"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: '#18181B', marginBottom: 5 }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="neo-input"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
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
              {isSubmitting ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
