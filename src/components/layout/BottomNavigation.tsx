// @ts-nocheck
import React from 'react';
import { House, ArrowLeftRight, Plus, ChartLine, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { triggerHaptic } from '../../utils/haptics';

export const BottomNavigation: React.FC = React.memo(() => {
  const { activeTab, setActiveTab, openAddExpense, language, t } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none select-none">
      <div className="w-full max-w-md pointer-events-auto">
        {/* Solid grounded navigation bar - No shadows, clean borders */}
        <nav
          role="navigation"
          aria-label={language === 'ar' ? 'شريط التنقل الرئيسي' : 'Main Navigation'}
          className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-1 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-colors"
        >
          <div className="flex items-center justify-between">
            {/* Home Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('home');
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95'
              }`}
            >
              <House size={20} strokeWidth={activeTab === 'home' ? 2.3 : 1.7} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {t.nav.home}
              </span>
            </button>

            {/* Transactions Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('transactions');
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95'
              }`}
            >
              <ArrowLeftRight size={20} strokeWidth={activeTab === 'transactions' ? 2.3 : 1.7} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {t.nav.transactions}
              </span>
            </button>

            {/* In-line Center Add Button */}
            <div className="flex-1 flex items-center justify-center py-0.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  openAddExpense();
                }}
                title={t.nav.addExpense}
                aria-label={t.nav.addExpense}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 focus:outline-hidden"
              >
                <Plus size={22} strokeWidth={2.4} />
              </button>
            </div>

            {/* Insights Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('insights');
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'insights'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95'
              }`}
            >
              <ChartLine size={20} strokeWidth={activeTab === 'insights' ? 2.3 : 1.7} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {t.nav.insights}
              </span>
            </button>

            {/* Settings Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('settings');
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95'
              }`}
            >
              <Settings size={20} strokeWidth={activeTab === 'settings' ? 2.3 : 1.7} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {t.nav.settings}
              </span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
});

BottomNavigation.displayName = 'BottomNavigation';
