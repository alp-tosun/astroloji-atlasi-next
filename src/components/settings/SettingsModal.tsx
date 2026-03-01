'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useSettingsStore } from '@/stores/settings-store';
import { useAuthStore } from '@/stores/auth-store';
import { useProfileStore } from '@/stores/profile-store';

type Theme = 'dark' | 'light' | 'system';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  lang: string;
  onLangChange: (lang: string) => void;
  t: (key: string) => string;
}

/* ── Sub-components ── */

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4 first:pt-0 border-b border-border/40 last:border-b-0">
      <h4 className="text-sm font-semibold text-text mb-3">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ToggleItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-text/90">{label}</span>
      <div className="relative" role="switch" aria-checked={checked} aria-label={label}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-border rounded-full peer-checked:bg-accent transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
}

function ThemeSelector({ value, onChange, t }: { value: Theme; onChange: (t: Theme) => void; t: (k: string) => string }) {
  const options: { key: Theme; icon: string; labelKey: string }[] = [
    { key: 'dark', icon: '\u{1F319}', labelKey: 'settings_theme_dark' },
    { key: 'light', icon: '\u2600\uFE0F', labelKey: 'settings_theme_light' },
    { key: 'system', icon: '\u{1F4BB}', labelKey: 'settings_theme_system' },
  ];

  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
            value === opt.key
              ? 'bg-accent text-white'
              : 'text-muted hover:text-text hover:bg-card/50'
          }`}
        >
          <span>{opt.icon}</span>
          <span>{t(opt.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Main Component ── */

export function SettingsModal({ open, onClose, lang, onLangChange, t }: SettingsModalProps) {
  const { theme, notifications, setTheme, setNotification } = useSettingsStore();
  const user = useAuthStore((s) => s.user);
  const clearProfile = useProfileStore((s) => s.clearProfile);

  const [toast, setToast] = useState('');
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [confirmDeleteData, setConfirmDeleteData] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // --- Profile Data ---
  const getStorageSize = () => {
    if (typeof window === 'undefined') return '0 KB';
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('astroloji')) {
        total += (localStorage.getItem(key) || '').length * 2; // UTF-16
      }
    }
    if (total < 1024) return `${total} B`;
    return `${(total / 1024).toFixed(1)} KB`;
  };

  const handleExportData = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('astroloji')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astroloji-atlas-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('settings_data_exported'));
  };

  const handleDeleteData = () => {
    setConfirmDeleteData(true);
  };

  const executeDeleteData = () => {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('astroloji')) keysToDelete.push(key);
    }
    keysToDelete.forEach((k) => localStorage.removeItem(k));
    clearProfile();
    setConfirmDeleteData(false);
    showToast(t('settings_data_deleted'));
  };

  // --- Account ---
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      const { auth } = await import('@/lib/firebase/client');
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, user.email);
      showToast(t('settings_password_reset_sent'));
    } catch {
      showToast(t('settings_password_reset_error'));
    }
  };

  // Check if user signed in with social provider (no password re-auth needed)
  const isSocialUser = user?.providerData?.some(
    (p) => p.providerId === 'google.com' || p.providerId === 'apple.com'
  );

  const handleDeleteAccount = async () => {
    if (!user) return;
    // Social users don't need password, email users do
    if (!isSocialUser && !deletePassword) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const { deleteUser } = await import('firebase/auth');

      if (isSocialUser) {
        // Social users: re-auth via popup (web) or redirect (native)
        const { isNative } = await import('@/lib/capacitor/platform');
        const providerId = user.providerData?.[0]?.providerId;
        if (isNative()) {
          const { reauthenticateWithRedirect } = await import('firebase/auth');
          if (providerId === 'google.com') {
            const { googleProvider } = await import('@/lib/firebase/client');
            await reauthenticateWithRedirect(user, googleProvider);
          } else if (providerId === 'apple.com') {
            const { appleProvider } = await import('@/lib/firebase/client');
            await reauthenticateWithRedirect(user, appleProvider);
          }
        } else {
          const { reauthenticateWithPopup } = await import('firebase/auth');
          if (providerId === 'google.com') {
            const { googleProvider } = await import('@/lib/firebase/client');
            await reauthenticateWithPopup(user, googleProvider);
          } else if (providerId === 'apple.com') {
            const { appleProvider } = await import('@/lib/firebase/client');
            await reauthenticateWithPopup(user, appleProvider);
          }
        }
      } else {
        // Email users: re-auth with password
        const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
        const credential = EmailAuthProvider.credential(user.email!, deletePassword);
        await reauthenticateWithCredential(user, credential);
      }

      await deleteUser(user);
      // Clean up local data
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('astroloji')) keysToDelete.push(key);
      }
      keysToDelete.forEach((k) => localStorage.removeItem(k));
      clearProfile();
      setDeleteAccountOpen(false);
      onClose();
    } catch {
      setDeleteError(t('settings_reauth_error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('settings_title')}>
      <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1 -mr-1">
        {/* 1. Appearance */}
        <SettingsSection title={t('settings_appearance')}>
          <ThemeSelector value={theme} onChange={setTheme} t={t} />
        </SettingsSection>

        {/* 2. Language */}
        <SettingsSection title={t('settings_language')}>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['tr', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => onLangChange(l)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  lang === l ? 'bg-accent text-white' : 'text-muted hover:text-text hover:bg-card/50'
                }`}
              >
                {l === 'tr' ? 'Türkçe' : 'English'}
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* 3. Notifications */}
        <SettingsSection title={t('settings_notifications')}>
          <ToggleItem
            label={t('settings_notif_daily')}
            checked={notifications.dailyReminder}
            onChange={(v) => setNotification('dailyReminder', v)}
          />
          <ToggleItem
            label={t('settings_notif_features')}
            checked={notifications.featureAnnouncements}
            onChange={(v) => setNotification('featureAnnouncements', v)}
          />
        </SettingsSection>

        {/* 4. Profile Data */}
        <SettingsSection title={t('settings_profile_data')}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{t('settings_storage_used')}</span>
            <span className="text-xs font-medium text-text">{getStorageSize()}</span>
          </div>
          <button
            onClick={handleExportData}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-card/50 transition-colors"
          >
            {t('settings_export_data')}
          </button>
          <button
            onClick={handleDeleteData}
            className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            {t('settings_delete_data')}
          </button>
        </SettingsSection>

        {/* 5. Legal */}
        <SettingsSection title={t('settings_legal')}>
          <Link
            href={`/${lang}/legal/privacy`}
            onClick={onClose}
            className="block w-full rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-card/50 transition-colors"
          >
            {t('settings_privacy_policy')}
          </Link>
          <Link
            href={`/${lang}/legal/terms`}
            onClick={onClose}
            className="block w-full rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-card/50 transition-colors"
          >
            {t('settings_terms')}
          </Link>
          <Link
            href={`/${lang}/legal/kvkk`}
            onClick={onClose}
            className="block w-full rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-card/50 transition-colors"
          >
            {t('settings_kvkk')}
          </Link>
        </SettingsSection>

        {/* 6. Account (only when logged in) */}
        {user && (
          <SettingsSection title={t('settings_account')}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{t('settings_email')}</span>
              <span className="text-xs font-medium text-text truncate ml-2">{user.email}</span>
            </div>
            {!isSocialUser && (
              <button
                onClick={handlePasswordReset}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-card/50 transition-colors"
              >
                {t('settings_change_password')}
              </button>
            )}

            {!deleteAccountOpen ? (
              <button
                onClick={() => setDeleteAccountOpen(true)}
                className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                {t('settings_delete_account')}
              </button>
            ) : (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 space-y-3">
                <p className="text-xs text-red-400">{t('settings_delete_account_warning')}</p>
                {!isSocialUser && (
                  <>
                    <p className="text-xs text-muted">{t('settings_delete_account_confirm')}</p>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent"
                      placeholder="********"
                    />
                  </>
                )}
                {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDeleteAccountOpen(false); setDeletePassword(''); setDeleteError(''); }}
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-muted hover:text-text transition-colors"
                  >
                    {t('btn_vazgec')}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={(!isSocialUser && !deletePassword) || deleteLoading}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? '...' : t('settings_delete_account_btn')}
                  </button>
                </div>
              </div>
            )}
          </SettingsSection>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-xl bg-accent px-4 py-2 text-sm text-white shadow-lg animate-[fadeSlideUp_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteData}
        title={t('settings_delete_data')}
        message={t('settings_delete_data_confirm')}
        confirmLabel={t('settings_delete_data')}
        cancelLabel={t('btn_vazgec')}
        variant="danger"
        onConfirm={executeDeleteData}
        onCancel={() => setConfirmDeleteData(false)}
      />
    </Modal>
  );
}
