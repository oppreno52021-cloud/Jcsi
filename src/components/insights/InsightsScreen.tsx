// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { Home, ArrowLeft, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, ChevronDown, View, Sparkles } from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { CategoryDetailModal } from './CategoryDetailModal';
import {
  calculateMonthInsights,
  formatCurrency,
  toArabicNumerals,
  getPreviousMonthString,
  getNextMonthString,
  getCurrentMonthPrefix,
  formatMonthTitle,
  getUserActiveMonthsList,
  groupExpensesByCategory
} from '../../utils/calculations';
import { formatMonthLabel, formatMonthShortLabel, getCategoryDisplayName } from '../../utils/i18n';
import { triggerHaptic } from '../../utils/haptics';


export const InsightsScreen = () => {
	const { expenses, categories, accounts, settings, referenceDate, setViewingExpense, setEditingExpense, setActiveTab, openAddExpense, language, numberFormat, t } = useApp();
	const formatNum = (val) => {
		return language === "ar" ? toArabicNumerals(val) : String(val);
	};
	const currentMonthPrefix = useMemo(() => getCurrentMonthPrefix(referenceDate), [referenceDate]);
	const [selectedMonthPrefix, setSelectedMonthPrefix] = useState(currentMonthPrefix);
	const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null);
	const [showAllCategories, setShowAllCategories] = useState(false);
	const pillsScrollRef = useRef(null);
	const insights = useMemo(() => {
		return calculateMonthInsights(expenses, categories, selectedMonthPrefix, referenceDate, accounts, language);
	}, [
		expenses,
		categories,
		selectedMonthPrefix,
		referenceDate,
		accounts,
		language
	]);
	const earliestMonthPrefix = useMemo(() => {
		return insights.historical6Months[0]?.monthPrefix || currentMonthPrefix;
	}, [insights.historical6Months, currentMonthPrefix]);
	const latestMonthPrefix = useMemo(() => {
		const list = insights.historical6Months;
		return list[list.length - 1]?.monthPrefix || currentMonthPrefix;
	}, [insights.historical6Months, currentMonthPrefix]);
	const canGoPrev = selectedMonthPrefix > earliestMonthPrefix;
	const canGoNext = selectedMonthPrefix < latestMonthPrefix;
	const handlePrevMonth = () => {
		if (canGoPrev) {
			setSelectedMonthPrefix((prev) => getPreviousMonthString(prev));
			setShowAllCategories(false);
		}
	};
	const handleNextMonth = () => {
		if (canGoNext) {
			setSelectedMonthPrefix((prev) => getNextMonthString(prev));
			setShowAllCategories(false);
		}
	};
	useEffect(() => {
		if (pillsScrollRef.current) {
			const selectedEl = pillsScrollRef.current.querySelector("[data-selected=\"true\"]");
			if (selectedEl && typeof selectedEl.scrollIntoView === "function") selectedEl.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center"
			});
		}
	}, [selectedMonthPrefix]);
	const selectedMonthExpenses = useMemo(() => {
		return expenses.filter((e) => !e.isDeleted && e.type === "expense" && e.date.startsWith(selectedMonthPrefix));
	}, [expenses, selectedMonthPrefix]);
	const displayedCategories = useMemo(() => {
		if (showAllCategories || insights.categoryBreakdown.length <= 4) return insights.categoryBreakdown;
		return insights.categoryBreakdown.slice(0, 4);
	}, [insights.categoryBreakdown, showAllCategories]);
	const topCategory = insights.categoryBreakdown[0];
	const isSpendingReduced = insights.monthComparison.hasPrevData && insights.monthComparison.difference < 0;
	const isSpendingIncreased = insights.monthComparison.hasPrevData && insights.monthComparison.difference > 0;
	return /* @__PURE__ */ _jsxs("div", {
		className: "space-y-4 pb-6",
		children: [
			/* @__PURE__ */ _jsxs("div", {
				className: "flex items-center gap-3 pt-1",
				children: [/* @__PURE__ */ _jsx("button", {
					type: "button",
					onClick: () => setActiveTab("home"),
					className: "p-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs shrink-0",
					title: language === "ar" ? "الرجوع للرئيسية" : "Back to Home",
					"aria-label": language === "ar" ? "الرجوع للرئيسية" : "Back to Home",
					children: /* @__PURE__ */ _jsx(ArrowLeft, {
						size: 18,
						strokeWidth: 1.5,
						className: "rtl:rotate-180"
					})
				}), /* @__PURE__ */ _jsx("div", { children: /* @__PURE__ */ _jsx("h1", {
					className: "text-lg font-bold text-slate-900 dark:text-white tracking-tight",
					children: t.insights.title
				}) })]
			}),
			/* @__PURE__ */ _jsxs("div", {
				className: "bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-2.5",
				children: [/* @__PURE__ */ _jsxs("div", {
					className: "flex items-center justify-between",
					children: [
						/* @__PURE__ */ _jsx("button", {
							type: "button",
							onClick: handlePrevMonth,
							disabled: !canGoPrev,
							className: `p-2 rounded-full transition-colors cursor-pointer ${canGoPrev ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" : "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40"}`,
							"aria-label": t.insights.previousMonth,
							children: /* @__PURE__ */ _jsx(ChevronLeft, {
								size: 18,
								strokeWidth: 1.5,
								className: "rtl:rotate-180"
							})
						}),
						/* @__PURE__ */ _jsxs("div", {
							className: "text-center",
							children: [/* @__PURE__ */ _jsx("h2", {
								className: "text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight",
								children: formatMonthLabel(selectedMonthPrefix, language)
							}), /* @__PURE__ */ _jsx("p", {
								className: "text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium",
								children: insights.isCurrentMonth ? t.insights.dayOf.replace("{day}", formatNum(insights.daysElapsed)).replace("{total}", formatNum(insights.daysInMonth)) : t.insights.calendarDays.replace("{days}", formatNum(insights.daysInMonth))
							})]
						}),
						/* @__PURE__ */ _jsx("button", {
							type: "button",
							onClick: handleNextMonth,
							disabled: !canGoNext,
							className: `p-2 rounded-full transition-colors cursor-pointer ${canGoNext ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" : "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40"}`,
							"aria-label": t.insights.nextMonth,
							children: /* @__PURE__ */ _jsx(ChevronRight, {
								size: 18,
								strokeWidth: 1.5,
								className: "rtl:rotate-180"
							})
						})
					]
				}), /* @__PURE__ */ _jsx("div", {
					ref: pillsScrollRef,
					className: "flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto no-scrollbar scroll-smooth",
					children: insights.historical6Months.map((m) => {
						const isSelected = m.monthPrefix === selectedMonthPrefix;
						m.monthPrefix;
						return /* @__PURE__ */ _jsx("button", {
							type: "button",
							"data-selected": isSelected ? "true" : void 0,
							onClick: () => {
								setSelectedMonthPrefix(m.monthPrefix);
								setShowAllCategories(false);
							},
							className: `flex-1 min-w-[76px] py-1.5 px-2.5 rounded-full text-xs font-semibold text-center whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 ${isSelected ? "bg-blue-600 text-white shadow-xs" : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
							children: /* @__PURE__ */ _jsx("span", { children: formatMonthShortLabel(m.monthPrefix, language) })
						}, m.monthPrefix);
					})
				})]
			}),
			insights.transactionCount === 0 ? /* @__PURE__ */ _jsxs("div", {
				className: "bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-3",
				children: [/* @__PURE__ */ _jsx("div", {
					className: "space-y-1",
					children: /* @__PURE__ */ _jsx("p", {
						className: "text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500",
						children: t.insights.noDataForMonth.replace("{month}", formatMonthLabel(selectedMonthPrefix, language))
					})
				}), /* @__PURE__ */ _jsxs("div", {
					className: "pt-2 flex justify-center gap-2",
					children: [!insights.isCurrentMonth && /* @__PURE__ */ _jsx("button", {
						type: "button",
						onClick: () => {
							setSelectedMonthPrefix(currentMonthPrefix);
							setShowAllCategories(false);
						},
						className: "px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer",
						children: t.insights.jumpToCurrentMonth
					}), /* @__PURE__ */ _jsx("button", {
						type: "button",
						onClick: () => openAddExpense(),
						className: "px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs",
						children: /* @__PURE__ */ _jsx("span", { children: t.insights.addExpense })
					})]
				})]
			}) : /* @__PURE__ */ _jsxs(_Fragment, { children: [
				/* @__PURE__ */ _jsxs("div", {
					className: "relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#070b14] via-[#0d1527] to-[#151c38] text-white border border-blue-500/20 shadow-xs space-y-3.5",
					children: [
						/* @__PURE__ */ _jsx("div", { className: "absolute -top-12 -right-12 w-32 h-32 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" }),
						/* @__PURE__ */ _jsx("div", { className: "absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" }),
						/* @__PURE__ */ _jsxs("div", {
							className: "relative flex items-center justify-between",
							children: [/* @__PURE__ */ _jsx("span", {
								className: "text-xs font-semibold text-slate-300",
								children: language === "ar" ? "إجمالي مصاريف الشهر" : "Total Monthly Expenses"
							}), /* @__PURE__ */ _jsxs("span", {
								className: "text-xs text-slate-400 bg-white/10 px-2 py-0.5 rounded-full border border-white/5",
								children: [
									formatNum(insights.transactionCount),
									" ",
									language === "ar" ? "معاملة" : "txns"
								]
							})]
						}),
						/* @__PURE__ */ _jsxs("div", {
							className: "relative flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ _jsx("div", {
								className: "text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-200 via-sky-300 to-blue-400 bg-clip-text text-transparent tracking-tight",
								children: formatCurrency(insights.totalSpent, settings.currency, language, false, numberFormat)
							}), insights.monthComparison.hasPrevData && /* @__PURE__ */ _jsxs("div", {
								className: `flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${isSpendingReduced ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : isSpendingIncreased ? "bg-rose-500/15 border-rose-500/30 text-rose-300" : "bg-white/10 border-white/10 text-slate-300"}`,
								children: [isSpendingReduced ? /* @__PURE__ */ _jsx(TrendingDown, {
									size: 14,
									strokeWidth: 1.5
								}) : isSpendingIncreased ? /* @__PURE__ */ _jsx(TrendingUp, {
									size: 14,
									strokeWidth: 1.5
								}) : null, /* @__PURE__ */ _jsxs("span", { children: [
									isSpendingReduced ? language === "ar" ? "أقل بـ " : "−" : isSpendingIncreased ? language === "ar" ? "أكثر بـ " : "+" : "",
									formatNum(Math.abs(insights.monthComparison.percentageChange ?? 0)),
									language === "ar" ? "٪" : "%"
								] })]
							})]
						}),
						/* @__PURE__ */ _jsxs("div", {
							className: "relative pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-300",
							children: [/* @__PURE__ */ _jsxs("div", { children: [/* @__PURE__ */ _jsx("span", { children: language === "ar" ? "المعدل اليومي: " : "Daily average: " }), /* @__PURE__ */ _jsx("strong", {
								className: "text-white font-bold",
								children: formatCurrency(insights.dailyAverage, settings.currency, language, false, numberFormat)
							})] }), (insights.totalIncome ?? 0) > 0 && /* @__PURE__ */ _jsxs("div", {
								className: "text-end",
								children: [/* @__PURE__ */ _jsx("span", { children: language === "ar" ? "الدخل: " : "Income: " }), /* @__PURE__ */ _jsxs("strong", {
									className: "text-emerald-400 font-bold",
									children: ["+", formatCurrency(insights.totalIncome ?? 0, settings.currency, language, false, numberFormat)]
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ _jsxs("div", {
					className: "bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3",
					children: [/* @__PURE__ */ _jsx("div", {
						className: "flex items-center justify-between",
						children: /* @__PURE__ */ _jsxs("div", { children: [/* @__PURE__ */ _jsx("h2", {
							className: "text-sm font-bold text-slate-900 dark:text-white",
							children: language === "ar" ? "أين ذهبت أموالك؟" : "Where Your Money Went"
						}), /* @__PURE__ */ _jsx("span", {
							className: "text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium",
							children: language === "ar" ? "أعلى فئات الصرف لهذا الشهر" : "Top spending categories"
						})] })
					}), /* @__PURE__ */ _jsxs("div", {
						className: "space-y-3 pt-1",
						children: [displayedCategories.map((item) => {
							return /* @__PURE__ */ _jsxs("div", {
								onClick: () => setSelectedCategoryForModal(item.category),
								className: "p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer space-y-2 border border-slate-100 dark:border-slate-800/60 shadow-2xs",
								children: [/* @__PURE__ */ _jsxs("div", {
									className: "flex items-center justify-between gap-3 text-xs",
									children: [/* @__PURE__ */ _jsxs("div", {
										className: "flex items-center gap-2.5 min-w-0 flex-1",
										children: [/* @__PURE__ */ _jsx(CategoryIcon, {
											name: item.category.icon,
											color: item.category.color,
											size: 19,
											strokeWidth: 1.5
										}), /* @__PURE__ */ _jsxs("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ _jsx("span", {
												className: "font-bold text-slate-900 dark:text-slate-100 truncate block",
												children: getCategoryDisplayName(item.category.name, language)
											}), /* @__PURE__ */ _jsxs("span", {
												className: "text-[11px] text-slate-500 dark:text-slate-400 block font-medium",
												children: [
													formatNum(item.count),
													" ",
													t.insights.txns
												]
											})]
										})]
									}), /* @__PURE__ */ _jsxs("div", {
										className: "text-end shrink-0",
										children: [/* @__PURE__ */ _jsx("span", {
											className: "font-bold text-slate-900 dark:text-white block",
											children: formatCurrency(item.total, settings.currency, language, false, numberFormat)
										}), /* @__PURE__ */ _jsxs("span", {
											className: "text-[11px] font-semibold text-slate-600 dark:text-slate-400 block",
											children: [formatNum(item.percentage), language === "ar" ? "٪" : "%"]
										})]
									})]
								}), /* @__PURE__ */ _jsx("div", {
									className: "w-full h-1.5 bg-blue-100/60 dark:bg-slate-800 rounded-full overflow-hidden",
									children: /* @__PURE__ */ _jsx("div", {
										className: "h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300",
										style: { width: `${Math.min(100, Math.max(3, item.percentage))}%` }
									})
								})]
							}, item.category.id);
						}), insights.categoryBreakdown.length > 4 && /* @__PURE__ */ _jsxs("button", {
							type: "button",
							onClick: () => setShowAllCategories((prev) => !prev),
							className: "w-full py-2 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5",
							children: [/* @__PURE__ */ _jsx(ChevronDown, {
								size: 14,
								strokeWidth: 1.5,
								className: showAllCategories ? "rotate-180 transition-transform" : "transition-transform"
							}), /* @__PURE__ */ _jsx("span", { children: showAllCategories ? language === "ar" ? "عرض فئات أقل" : "Show Less" : language === "ar" ? `عرض باقي الفئات (${formatNum(insights.categoryBreakdown.length - 4)} فئات أخرى)` : `View all (${formatNum(insights.categoryBreakdown.length - 4)} more)` })]
						})]
					})]
				}),
				topCategory && /* @__PURE__ */ _jsxs("div", {
					className: "bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-blue-200/50 dark:border-blue-900/40 shadow-xs space-y-2",
					children: [/* @__PURE__ */ _jsxs("div", {
						className: "flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300",
						children: [/* @__PURE__ */ _jsx(Sparkles, {
							size: 15,
							strokeWidth: 1.5,
							className: "text-blue-600 dark:text-blue-400 shrink-0"
						}), /* @__PURE__ */ _jsx("span", { children: language === "ar" ? "خلاصة الشهر" : "Month Takeaway" })]
					}), /* @__PURE__ */ _jsx("p", {
						className: "text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed",
						children: language === "ar" ? /* @__PURE__ */ _jsxs(_Fragment, { children: [
							"بند ",
							/* @__PURE__ */ _jsx("strong", {
								className: "text-slate-900 dark:text-white font-bold",
								children: getCategoryDisplayName(topCategory.category.name, "ar")
							}),
							" هو صاحب النصيب الأكبر من نفقاتك هذا الشهر بنسبة",
							" ",
							/* @__PURE__ */ _jsxs("strong", {
								className: "text-slate-900 dark:text-white font-bold",
								children: [formatNum(topCategory.percentage), "٪"]
							}),
							" (",
							formatCurrency(topCategory.total, settings.currency, "ar", false, numberFormat),
							").",
							insights.largestExpense && insights.largestExpense.amount > 0 && /* @__PURE__ */ _jsxs(_Fragment, { children: [
								" وكانت أكبر معاملة منفردة بقيمة ",
								/* @__PURE__ */ _jsx("strong", {
									className: "text-slate-900 dark:text-white font-bold",
									children: formatCurrency(insights.largestExpense.amount, settings.currency, "ar", false, numberFormat)
								}),
								insights.largestExpense.note ? ` (${insights.largestExpense.note})` : "",
								"."
							] })
						] }) : /* @__PURE__ */ _jsxs(_Fragment, { children: [
							/* @__PURE__ */ _jsx("strong", {
								className: "text-slate-900 dark:text-white font-bold",
								children: getCategoryDisplayName(topCategory.category.name, "en")
							}),
							" took the highest share of your spending at",
							" ",
							/* @__PURE__ */ _jsxs("strong", {
								className: "text-slate-900 dark:text-white font-bold",
								children: [formatNum(topCategory.percentage), "%"]
							}),
							" (",
							formatCurrency(topCategory.total, settings.currency, "en", false, numberFormat),
							").",
							insights.largestExpense && insights.largestExpense.amount > 0 && /* @__PURE__ */ _jsxs(_Fragment, { children: [
								" The single largest transaction was ",
								/* @__PURE__ */ _jsx("strong", {
									className: "text-slate-900 dark:text-white font-bold",
									children: formatCurrency(insights.largestExpense.amount, settings.currency, "en", false, numberFormat)
								}),
								insights.largestExpense.note ? ` (${insights.largestExpense.note})` : "",
								"."
							] })
						] })
					})]
				})
			] }),
			/* @__PURE__ */ _jsx(CategoryDetailModal, {
				category: selectedCategoryForModal,
				expenses: selectedMonthExpenses,
				currency: settings.currency,
				totalPeriodSpend: insights.totalSpent,
				monthLabel: formatMonthLabel(selectedMonthPrefix, language),
				onClose: () => setSelectedCategoryForModal(null),
				onSelectTransaction: (exp) => {
					setSelectedCategoryForModal(null);
					setEditingExpense(exp);
					openAddExpense();
				}
			})
		]
	});
};
