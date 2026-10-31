// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { HomeScreen } from '../home/HomeScreen';
import { TransactionsScreen } from '../transactions/TransactionsScreen';
import { InsightsScreen } from '../insights/InsightsScreen';
import { SettingsScreen } from '../settings/SettingsScreen';
import { BottomNavigation } from './BottomNavigation';
import { AddExpenseModal } from '../expense/AddExpenseModal';
import { TransactionDetailModal } from '../transactions/TransactionDetailModal';
import { LockScreen } from '../security/LockScreen';
import { Toast } from '../ui/Toast';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useBackHandler } from '../../hooks/useBackHandler';
import { navigationManager } from '../../utils/navigationManager';

export const MobileShell: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    isAddExpenseOpen, 
    openAddExpense,
    closeAddExpense, 
    editingExpense, 
    setEditingExpense, 
    viewingExpense, 
    setViewingExpense,
    settings,
    isLoading,
    language,
    updateSettings
  } = useApp();

  const isLockEnabled = Boolean(settings.pinLockEnabled || settings.biometricLock);

  // Auto-mark onboarding as completed on startup so no introductory modal blocks the user
  useEffect(() => {
    if (!isLoading && !settings.hasCompletedOnboarding) {
      updateSettings({ hasCompletedOnboarding: true });
    }
  }, [isLoading, settings.hasCompletedOnboarding, updateSettings]);
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      const pin = localStorage.getItem('masrofy_pin_lock') === 'true';
      const bio = localStorage.getItem('masrofy_biometric_lock') === 'true';
      return pin || bio;
    } catch {
      return false;
    }
  });

  // Sync isLocked whenever isLockEnabled becomes active
  useEffect(() => {
    if (isLockEnabled) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  }, [isLockEnabled]);

  useEffect(() => {
    if (!isLockEnabled) {
      setIsLocked(false);
      return;
    }

    const lockAppImmediately = () => {
      setIsLocked(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lockAppImmediately();
      }
    };

    const handleLockNow = () => {
      lockAppImmediately();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('masrofy_lock_now', handleLockNow);

    // Native Android App Lifecycle listener via Capacitor
    let capacitorListener: any = null;
    try {
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
          if (!isActive) {
            lockAppImmediately();
          }
        }).then((listener: any) => {
          capacitorListener = listener;
        }).catch(() => {});
      }
    } catch {}

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('masrofy_lock_now', handleLockNow);
      if (capacitorListener?.remove) {
        capacitorListener.remove();
      }
    };
  }, [isLockEnabled]);

  // Unified Tab & Back Navigation:
  useEffect(() => {
    navigationManager.init(
      activeTab, 
      (tab) => {
        setActiveTab(tab);
      },
      () => {}
    );
  }, [setActiveTab]);

  useEffect(() => {
    navigationManager.setTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    navigationManager.setLocked(Boolean(isLockEnabled && isLocked));
  }, [isLockEnabled, isLocked]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-start font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Mobile-first viewport container */}
      <main className="w-full max-w-md min-h-screen flex flex-col relative bg-slate-50 dark:bg-slate-950 sm:shadow-sm sm:border-x sm:border-slate-200/80 dark:sm:border-slate-800">
        {/* Screen Body with safe area padding */}
        <div className="flex-1 w-full px-4 pt-3 pb-28 sm:pb-32">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>{settings.language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</span>
            </div>
          ) : (
            <>
              {activeTab === 'home' && <HomeScreen />}
              {activeTab === 'transactions' && <TransactionsScreen />}
              {activeTab === 'insights' && <InsightsScreen />}
              {activeTab === 'settings' && <SettingsScreen />}
            </>
          )}
        </div>

        {/* Bottom Navigation with Center Elevated + Button */}
        <BottomNavigation />
      </main>

      {/* Add Expense / Income Modal */}
      {isAddExpenseOpen && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => {
            closeAddExpense();
            setEditingExpense(null);
          }}
          editExpense={editingExpense}
        />
      )}

      {/* Transaction Details Modal */}
      {viewingExpense && (
        <TransactionDetailModal
          expense={viewingExpense}
          onClose={() => setViewingExpense(null)}
          onEdit={(exp) => {
            setViewingExpense(null);
            setEditingExpense(exp);
            openAddExpense();
          }}
        />
      )}

      {/* Biometric & Passcode Lock Screen */}
      {isLockEnabled && isLocked && (
        <LockScreen
          onUnlock={() => setIsLocked(false)}
          savedPasscode={settings.passcode || '123456'}
          biometricEnabled={Boolean(settings.biometricLock)}
          pinEnabled={Boolean(settings.pinLockEnabled)}
          language={language === 'en' ? 'en' : 'ar'}
        />
      )}

      {/* Global Toast with Undo support */}
      <Toast />
    </div>
  );
};
