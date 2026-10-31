import 'fake-indexeddb/auto';
import React from 'react';
import { renderToString } from 'react-dom/server';

global.window = {
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  history: {
    pushState: () => {},
    replaceState: () => {}
  },
  matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} })
};
global.document = {
  documentElement: {
    classList: { add: () => {}, remove: () => {} },
    setAttribute: () => {},
    style: {}
  },
  body: { style: {}, appendChild: () => {}, removeChild: () => {} },
  getElementById: () => null
};
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: { vibrate: () => false },
    configurable: true,
    writable: true,
  });
} catch (e) {
  // Ignore if already defined
}
global.localStorage = global.window.localStorage;

(async () => {
  const { AppProvider, useApp } = await import('./src/context/AppContext.tsx');
  const { HomeScreen } = await import('./src/components/home/HomeScreen.tsx');
  const { TransactionsScreen } = await import('./src/components/transactions/TransactionsScreen.tsx');
  const { InsightsScreen } = await import('./src/components/insights/InsightsScreen.tsx');
  const { SettingsScreen } = await import('./src/components/settings/SettingsScreen.tsx');
  const { AddExpenseModal } = await import('./src/components/expense/AddExpenseModal.tsx');
  const { LockScreen } = await import('./src/components/security/LockScreen.tsx');
  const { TransactionDetailModal } = await import('./src/components/transactions/TransactionDetailModal.tsx');

  function Wrapper({ children }) {
    return React.createElement(AppProvider, null, children);
  }

  const screens = [
    { name: 'HomeScreen', component: HomeScreen, props: {} },
    { name: 'TransactionsScreen', component: TransactionsScreen, props: {} },
    { name: 'InsightsScreen', component: InsightsScreen, props: {} },
    { name: 'SettingsScreen', component: SettingsScreen, props: {} },
    { name: 'AddExpenseModal', component: AddExpenseModal, props: { isOpen: true, onClose: () => {} } },
    { name: 'LockScreen', component: LockScreen, props: { onUnlock: () => {} } },
    { name: 'TransactionDetailModal', component: TransactionDetailModal, props: { expense: { id: '1', amount: 50, type: 'expense', categoryId: 'cat-food', accountId: 'acc-cash', date: '2026-10-30', createdAt: '2026-10-30T10:00:00Z' }, onClose: () => {} } },
  ];

  for (const s of screens) {
    try {
      const html = renderToString(React.createElement(Wrapper, null, React.createElement(s.component, s.props)));
      console.log(`[PASS] ${s.name}: length ${html.length}`);
    } catch(err) {
      console.error(`[FAIL] ${s.name}:`, err);
    }
  }
})();
