// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Copy, 
  RotateCcw, 
  ShoppingBag,
  Sparkles,
  Edit2,
  Delete,
  CornerDownLeft,
  ChevronDown,
  ChevronUp,
  Hash
} from 'lucide-react';
import { 
  toMinorUnits, 
  fromMinorUnits, 
  formatCurrency, 
  normalizeArabicNumerals,
  toArabicNumerals
} from '../../utils/calculations';
import { triggerHaptic } from '../../utils/haptics';
import { useBackHandler } from '../../hooks/useBackHandler';

export interface MarketItem {
  id: string;
  name: string;
  price: string;
  quantity?: number;
}

interface MarketTallyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAsExpense: (total: number, summary: string) => void;
  currency?: string;
  language?: 'en' | 'ar';
}

const STORAGE_KEY = 'masrofy_market_tally_items';
const SUGGESTIONS_KEY = 'masrofy_market_custom_items';

const DEFAULT_SUGGESTIONS_AR = [
  'طماطم', 'خيار', 'بطاطس', 'بصل', 'فواكه', 'لحوم', 'دواجن', 'ألبان', 'خبز', 'مياه وعصائر', 'منظفات', 'مناديل', 'معلبات'
];

const DEFAULT_SUGGESTIONS_EN = [
  'Tomatoes', 'Cucumbers', 'Potatoes', 'Onions', 'Fruits', 'Meat', 'Poultry', 'Dairy', 'Bread', 'Beverages', 'Detergent', 'Tissues', 'Canned Food'
];

const QUICK_INCREMENTS = [5, 10, 20, 50, 100];

export const MarketTallyModal: React.FC<MarketTallyModalProps> = ({
  isOpen,
  onClose,
  onApplyAsExpense,
  currency = 'EGP',
  language = 'ar',
}) => {
  const isAr = language === 'ar';
  useBackHandler(isOpen, onClose, 'market-tally-modal');

  // Initialize items from localStorage or create 3 initial items
  const [items, setItems] = useState<MarketItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(it => ({ ...it, quantity: it.quantity || 1 }));
        }
      }
    } catch {}
    return [
      { id: '1', name: '', price: '', quantity: 1 },
      { id: '2', name: '', price: '', quantity: 1 },
      { id: '3', name: '', price: '', quantity: 1 },
    ];
  });

  // Customizable quick items stored in localStorage
  const [customSuggestions, setCustomSuggestions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SUGGESTIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return isAr ? DEFAULT_SUGGESTIONS_AR : DEFAULT_SUGGESTIONS_EN;
  });

  const [isEditingSuggestions, setIsEditingSuggestions] = useState(false);
  const [newSuggestionInput, setNewSuggestionInput] = useState('');
  const [isAddingSuggestion, setIsAddingSuggestion] = useState(false);

  // Active item for fast in-app numpad & steppers
  const [activeItemId, setActiveItemId] = useState<string | null>(() => items[0]?.id || null);
  const [showKeypad, setShowKeypad] = useState(false);

  const [copied, setCopied] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  // Auto-save items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Auto-save custom suggestions
  useEffect(() => {
    try {
      localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(customSuggestions));
    } catch {}
  }, [customSuggestions]);

  // Ensure an active item exists if possible
  useEffect(() => {
    if (!activeItemId && items.length > 0) {
      setActiveItemId(items[0].id);
    }
  }, [items, activeItemId]);

  // Accurate monetary summation accounting for quantity
  const totalAmount = useMemo(() => {
    let totalMinor = 0;
    for (const item of items) {
      const cleanNum = parseFloat(normalizeArabicNumerals(item.price)) || 0;
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      if (cleanNum > 0) {
        totalMinor += toMinorUnits(cleanNum * qty);
      }
    }
    return fromMinorUnits(totalMinor);
  }, [items]);

  const validItemsCount = useMemo(() => {
    return items.filter(i => (parseFloat(normalizeArabicNumerals(i.price)) || 0) > 0 || i.name.trim()).length;
  }, [items]);

  if (!isOpen) return null;

  const handleUpdateItem = (id: string, field: 'name' | 'price' | 'quantity', value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleAddItem = (initialName = '') => {
    triggerHaptic('light');
    const newId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newItem: MarketItem = {
      id: newId,
      name: initialName,
      price: '',
      quantity: 1
    };
    setItems(prev => [...prev, newItem]);
    setActiveItemId(newId);
    setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleDeleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic('light');
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      if (filtered.length === 0) {
        const fallbackId = `item-${Date.now()}`;
        setActiveItemId(fallbackId);
        return [{ id: fallbackId, name: '', price: '', quantity: 1 }];
      }
      if (activeItemId === id) {
        setActiveItemId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  const handleClearAll = () => {
    triggerHaptic('medium');
    const id1 = `item-${Date.now()}-1`;
    setItems([
      { id: id1, name: '', price: '', quantity: 1 },
      { id: `item-${Date.now()}-2`, name: '', price: '', quantity: 1 },
    ]);
    setActiveItemId(id1);
  };

  const handleApplyQuickChip = (suggestion: string) => {
    triggerHaptic('light');
    // Check if there's an empty row to fill
    const emptyRow = items.find(i => !i.name.trim() && !i.price.trim());
    if (emptyRow) {
      handleUpdateItem(emptyRow.id, 'name', suggestion);
      setActiveItemId(emptyRow.id);
    } else {
      handleAddItem(suggestion);
    }
  };

  // Add custom suggestion to list
  const handleAddCustomSuggestion = () => {
    const val = newSuggestionInput.trim();
    if (!val) return;
    if (!customSuggestions.includes(val)) {
      triggerHaptic('medium');
      setCustomSuggestions(prev => [val, ...prev]);
    }
    setNewSuggestionInput('');
    setIsAddingSuggestion(false);
  };

  // Remove a suggestion chip
  const handleRemoveSuggestion = (suggestion: string) => {
    triggerHaptic('light');
    setCustomSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  // Reset suggestions to default
  const handleResetSuggestions = () => {
    triggerHaptic('medium');
    setCustomSuggestions(isAr ? DEFAULT_SUGGESTIONS_AR : DEFAULT_SUGGESTIONS_EN);
    setIsEditingSuggestions(false);
  };

  // Quick Increment Price on active item (+5, +10, etc.)
  const handleIncrementPrice = (amount: number) => {
    if (!activeItemId) return;
    triggerHaptic('light');
    const activeItem = items.find(i => i.id === activeItemId);
    const currentPrice = parseFloat(normalizeArabicNumerals(activeItem?.price || '0')) || 0;
    const newPrice = Math.max(0, currentPrice + amount);
    handleUpdateItem(activeItemId, 'price', String(newPrice));
  };

  // Adjust Quantity (+ / -)
  const handleAdjustQuantity = (id: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    const it = items.find(i => i.id === id);
    if (!it) return;
    const curQty = it.quantity || 1;
    const newQty = Math.max(1, curQty + delta);
    handleUpdateItem(id, 'quantity', newQty);
  };

  // Fast In-App Numpad Actions
  const handleNumpadDigit = (digit: string) => {
    if (!activeItemId) return;
    triggerHaptic('light');
    const activeItem = items.find(i => i.id === activeItemId);
    let curPrice = activeItem?.price || '';

    if (digit === '.') {
      if (curPrice.includes('.')) return;
      if (!curPrice) curPrice = '0';
      handleUpdateItem(activeItemId, 'price', curPrice + '.');
      return;
    }

    if (curPrice === '0') {
      curPrice = '';
    }
    handleUpdateItem(activeItemId, 'price', curPrice + digit);
  };

  const handleNumpadBackspace = () => {
    if (!activeItemId) return;
    triggerHaptic('light');
    const activeItem = items.find(i => i.id === activeItemId);
    const curPrice = activeItem?.price || '';
    if (curPrice.length > 0) {
      handleUpdateItem(activeItemId, 'price', curPrice.slice(0, -1));
    }
  };

  const handleNumpadClear = () => {
    if (!activeItemId) return;
    triggerHaptic('medium');
    handleUpdateItem(activeItemId, 'price', '');
  };

  // Advance to next row or create a new row
  const handleAdvanceToNext = () => {
    triggerHaptic('light');
    const currentIndex = items.findIndex(i => i.id === activeItemId);
    if (currentIndex !== -1 && currentIndex < items.length - 1) {
      setActiveItemId(items[currentIndex + 1].id);
    } else {
      handleAddItem();
    }
  };

  const buildSummaryText = () => {
    const validLines = items
      .filter(i => (parseFloat(normalizeArabicNumerals(i.price)) || 0) > 0 || i.name.trim())
      .map(i => {
        const p = parseFloat(normalizeArabicNumerals(i.price)) || 0;
        const q = i.quantity && i.quantity > 1 ? ` (×${i.quantity})` : '';
        const n = i.name.trim() || (isAr ? 'بند' : 'Item');
        const subtotal = p * (i.quantity || 1);
        return `${n}${q}: ${subtotal} ${currency === 'EGP' ? (isAr ? 'ج.م' : 'EGP') : currency}`;
      });

    return validLines.join(' · ');
  };

  const handleConfirmAsExpense = () => {
    if (totalAmount <= 0) return;
    triggerHaptic('success');
    const summary = buildSummaryText();
    onApplyAsExpense(totalAmount, summary);
    onClose();
  };

  const handleCopySummary = () => {
    triggerHaptic('medium');
    const formatted = `${isAr ? '🛒 قائمة المشتريات' : '🛒 Shopping List'}:\n` +
      items
        .filter(i => (parseFloat(normalizeArabicNumerals(i.price)) || 0) > 0 || i.name.trim())
        .map((i, idx) => {
          const p = parseFloat(normalizeArabicNumerals(i.price)) || 0;
          const q = i.quantity && i.quantity > 1 ? ` (×${i.quantity})` : '';
          const sub = p * (i.quantity || 1);
          return `${idx + 1}. ${i.name || (isAr ? 'بند' : 'Item')}${q}: ${sub} ${isAr ? 'ج.م' : 'EGP'}`;
        })
        .join('\n') +
      `\n------------------\n${isAr ? 'الإجمالي الكلي' : 'Total'}: ${totalAmount} ${isAr ? 'ج.م' : 'EGP'}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col max-h-[94vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        {/* Header Bar - Emerald & Teal Refresh */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <ShoppingCart size={19} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {isAr ? 'حاسبة المشتريات' : 'Shopping Tally'}
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isAr ? 'سريعة وسهلة باللمس للسوبرماركت' : 'Quick touch tally for grocery shopping'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {validItemsCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title={isAr ? 'مسح الكل والبدء من جديد' : 'Clear All'}
              >
                <RotateCcw size={16} strokeWidth={1.8} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={19} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Top Prominent Total Summary Card */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-300/40 dark:border-emerald-700/40 shadow-xs">
            <div>
              <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block">
                {isAr ? 'المجموع الكلي:' : 'Total Shopping:'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isAr ? `${validItemsCount} بنود مسجلة` : `${validItemsCount} items`}
              </span>
            </div>

            <div className="text-end">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight tabular-nums">
                {formatCurrency(totalAmount, currency, language, false)}
              </span>
            </div>
          </div>
        </div>

        {/* Customizable Quick Item Chips Bar */}
        <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/40 border-y border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold select-none">
              {isAr ? 'بنود مقترحة سريعة:' : 'Quick items:'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAddingSuggestion(prev => !prev)}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus size={11} strokeWidth={2.5} />
                <span>{isAr ? 'إضافة صنف' : 'Add custom'}</span>
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                onClick={() => setIsEditingSuggestions(prev => !prev)}
                className={`text-[10px] font-bold cursor-pointer ${
                  isEditingSuggestions ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {isEditingSuggestions ? (isAr ? 'تم' : 'Done') : (isAr ? 'تعديل' : 'Edit')}
              </button>
            </div>
          </div>

          {/* Add custom suggestion inline input */}
          {isAddingSuggestion && (
            <div className="flex items-center gap-1.5 mb-2 animate-in fade-in duration-100">
              <input
                type="text"
                placeholder={isAr ? 'اسم الصنف الجديد...' : 'New item name...'}
                value={newSuggestionInput}
                onChange={(e) => setNewSuggestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCustomSuggestion();
                }}
                className="flex-1 text-xs py-1 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-400 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustomSuggestion}
                className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg shadow-xs cursor-pointer active:scale-95"
              >
                {isAr ? 'حفظ' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSuggestion(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Chips list */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {customSuggestions.map((item) => (
              <div key={item} className="inline-flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleApplyQuickChip(item)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                >
                  <span>{item}</span>
                </button>
                {isEditingSuggestions && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSuggestion(item)}
                    className="w-4 h-4 -ms-1.5 -mt-2 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] hover:bg-rose-600 cursor-pointer shadow-xs"
                    title={isAr ? 'حذف هذا الصنف' : 'Delete item'}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {isEditingSuggestions && (
              <button
                type="button"
                onClick={handleResetSuggestions}
                className="text-[10px] text-slate-400 underline px-1 shrink-0 cursor-pointer"
              >
                {isAr ? 'استعادة الافتراضي' : 'Reset defaults'}
              </button>
            )}
          </div>
        </div>

        {/* Items List Body */}
        <div className="flex-1 overflow-y-auto px-4 py-2.5 space-y-2">
          {items.map((item, index) => {
            const isActive = item.id === activeItemId;
            const priceNum = parseFloat(normalizeArabicNumerals(item.price)) || 0;
            const qty = item.quantity || 1;
            const subtotal = priceNum * qty;

            return (
              <div 
                key={item.id}
                onClick={() => setActiveItemId(item.id)}
                className={`p-2 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  isActive 
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' 
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Row Number */}
                  <span className={`w-5 text-center text-[11px] font-bold select-none ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {isAr ? toArabicNumerals(index + 1) : index + 1}
                  </span>

                  {/* Item Name Input */}
                  <input
                    type="text"
                    placeholder={isAr ? 'اسم الصنف (مثال: طماطم)' : 'Item name (e.g. Tomatoes)'}
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden px-1"
                  />

                  {/* Quantity Stepper (- 1 +) */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleAdjustQuantity(item.id, -1, e)}
                      className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white rounded active:bg-slate-100 dark:active:bg-slate-800 text-xs font-black cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 w-4 text-center tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleAdjustQuantity(item.id, 1, e)}
                      className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white rounded active:bg-slate-100 dark:active:bg-slate-800 text-xs font-black cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Price Box */}
                  <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shrink-0 w-24 text-center ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 border-emerald-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className="w-full text-center text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {item.price ? item.price : '0'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 select-none">
                      {isAr ? 'ج.م' : 'EGP'}
                    </span>
                  </div>

                  {/* Delete Row Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                </div>

                {/* Subtotal preview if quantity > 1 */}
                {qty > 1 && priceNum > 0 && (
                  <div className="flex justify-end pt-1 px-1 text-[10px] text-slate-500 font-semibold tabular-nums">
                    {isAr ? `المجموع: ${subtotal} ج.م (${qty} × ${priceNum})` : `Subtotal: ${subtotal} (${qty} × ${priceNum})`}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Row Button */}
          <button
            type="button"
            onClick={() => handleAddItem()}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
          >
            <Plus size={15} strokeWidth={2} className="text-emerald-600 dark:text-emerald-400" />
            <span>{isAr ? 'إضافة سطر جديد' : 'Add New Item'}</span>
          </button>

          <div ref={listEndRef} />
        </div>

        {/* Quick Increment Chips for Active Item (+5, +10, +20, +50, +100) */}
        <div className="px-4 py-1.5 bg-slate-100/90 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-700/80 shrink-0">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
              {isAr ? 'إضافة سريعة بالسعر:' : 'Quick add:'}
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_INCREMENTS.map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleIncrementPrice(inc)}
                  className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer active:scale-95 shadow-2xs tabular-nums"
                >
                  +{inc}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowKeypad(prev => !prev);
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                showKeypad
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
              title={showKeypad ? (isAr ? 'إخفاء لوحة الأرقام' : 'Hide Numpad') : (isAr ? 'إظهار لوحة الأرقام' : 'Show Numpad')}
            >
              <Hash size={13} strokeWidth={2} />
              <span>{showKeypad ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'لوحة الأرقام' : 'Keypad')}</span>
            </button>
          </div>
        </div>

        {/* In-App Touch Keypad (No OS keyboard blocking screen!) */}
        {showKeypad && (
          <div dir="ltr" className="px-3 py-2 bg-slate-50 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800 shrink-0 animate-in fade-in duration-150">
            <div className="grid grid-cols-4 gap-1.5 max-w-sm mx-auto">
              {/* Row 1 */}
              <button
                type="button"
                onClick={() => handleNumpadDigit('1')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => handleNumpadDigit('2')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => handleNumpadDigit('3')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                3
              </button>
              <button
                type="button"
                onClick={handleNumpadBackspace}
                className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-500 font-bold text-xs shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
                title={isAr ? 'مسح رقم' : 'Backspace'}
              >
                ⌫
              </button>

              {/* Row 2 */}
              <button
                type="button"
                onClick={() => handleNumpadDigit('4')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                4
              </button>
              <button
                type="button"
                onClick={() => handleNumpadDigit('5')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                5
              </button>
              <button
                type="button"
                onClick={() => handleNumpadDigit('6')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                6
              </button>
              <button
                type="button"
                onClick={handleNumpadClear}
                className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
                title={isAr ? 'تصفير' : 'Clear'}
              >
                C
              </button>

              {/* Row 3 */}
              <button
                type="button"
                onClick={() => handleNumpadDigit('7')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                7
              </button>
              <button
                type="button"
                onClick={() => handleNumpadDigit('8')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                8
              </button>
              <button
                type="button"
                onClick={() => handleNumpadDigit('9')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                9
              </button>
              <button
                type="button"
                onClick={handleAdvanceToNext}
                className="row-span-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1"
                title={isAr ? 'التالي' : 'Next'}
              >
                <CornerDownLeft size={16} strokeWidth={2.2} />
                <span className="text-[10px]">{isAr ? 'التالي' : 'Next'}</span>
              </button>

              {/* Row 4 */}
              <button
                type="button"
                onClick={() => handleNumpadDigit('.')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => handleNumpadDigit('0')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleNumpadDigit('00')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs shadow-2xs border border-slate-200/80 dark:border-slate-700/80 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                00
              </button>
            </div>
          </div>
        )}

        {/* Action Bottom Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              disabled={totalAmount <= 0}
              className={`col-span-1 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              } disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs`}
              title={isAr ? 'نسخ المشتريات' : 'Copy'}
            >
              {copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={1.8} />}
              <span className="hidden sm:inline">{isAr ? 'نسخ' : 'Copy'}</span>
            </button>

            <button
              type="button"
              disabled={totalAmount <= 0}
              onClick={handleConfirmAsExpense}
              className={`col-span-3 py-3 rounded-xl font-extrabold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer ${
                totalAmount > 0
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25 ring-1 ring-emerald-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingBag size={17} strokeWidth={2} />
              <span>{isAr ? 'اعتماد وتسجيل كمصروف' : 'Apply as Expense'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
