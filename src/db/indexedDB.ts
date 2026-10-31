// @ts-nocheck
import { Expense, Category, Account, Budget, RecurringTransaction, AppSettings } from "../types";


export const DB_NAME = "AuraSpendDB";
export const DB_VERSION = 1;
export const DEFAULT_CATEGORIES = [
  { id: 'cat-food', name: 'طعام ومأكولات', nameAr: 'طعام ومأكولات', nameEn: 'Food & Dining', icon: 'Utensils', color: '#EF4444', sortOrder: 1, isActive: true },
  { id: 'cat-groceries', name: 'سوبرماركت وبقالة', nameAr: 'سوبرماركت وبقالة', nameEn: 'Groceries', icon: 'ShoppingCart', color: '#F97316', sortOrder: 2, isActive: true },
  { id: 'cat-transport', name: 'مواصلات وبنزين', nameAr: 'مواصلات وبنزين', nameEn: 'Transport', icon: 'Car', color: '#0EA5E9', sortOrder: 3, isActive: true },
  { id: 'cat-bills', name: 'فواتير وكهرباء', nameAr: 'فواتير وكهرباء', nameEn: 'Bills & Utilities', icon: 'Zap', color: '#F59E0B', sortOrder: 4, isActive: true },
  { id: 'cat-coffee', name: 'قهوة وكافيه', nameAr: 'قهوة وكافيه', nameEn: 'Coffee & Drinks', icon: 'Coffee', color: '#B45309', sortOrder: 5, isActive: true },
  { id: 'cat-health', name: 'صحة وصيدلية', nameAr: 'صحة وصيدلية', nameEn: 'Health & Pharmacy', icon: 'HeartPulse', color: '#EC4899', sortOrder: 6, isActive: true },
  { id: 'cat-shopping', name: 'تسوق وملابس', nameAr: 'تسوق وملابس', nameEn: 'Shopping & Clothes', icon: 'ShoppingBag', color: '#A855F7', sortOrder: 7, isActive: true },
  { id: 'cat-salary', name: 'راتب ودخل عمل', nameAr: 'راتب ودخل عمل', nameEn: 'Salary & Work', icon: 'Briefcase', color: '#15803D', sortOrder: 8, isActive: true, type: 'income' },
  { id: 'cat-general', name: 'عام ومصروفات أخرى', nameAr: 'عام ومصروفات أخرى', nameEn: 'General / Other', icon: 'Tag', color: '#64748B', sortOrder: 9, isActive: true }
];

export const DEFAULT_ACCOUNTS = [
  { id: 'acc-cash', name: 'كاش ونقد', nameAr: 'كاش ونقد', nameEn: 'Cash', type: 'cash', openingBalance: 0, currentBalance: 0, icon: 'Banknote', color: '#10B981', sortOrder: 1, isActive: true, isArchived: false, showOnHome: true },
  { id: 'acc-bank', name: 'حساب بنكي', nameAr: 'حساب بنكي', nameEn: 'Bank Account', type: 'bank', openingBalance: 0, currentBalance: 0, icon: 'Landmark', color: '#1E3A8A', sortOrder: 2, isActive: true, isArchived: false, showOnHome: true },
  { id: 'acc-wallet', name: 'محفظة إلكترونية', nameAr: 'محفظة إلكترونية', nameEn: 'Mobile Wallet', type: 'wallet', openingBalance: 0, currentBalance: 0, icon: 'Smartphone', color: '#EA580C', sortOrder: 3, isActive: true, isArchived: false, showOnHome: true }
];
export const DEFAULT_SETTINGS = {
	currency: "EGP",
	currencySymbol: "ج.م",
	language: "ar",
	theme: "light",
	fontSize: "normal",
	fontFamily: "ibm",
	numberFormat: "arabic",
	notifications: true,
	biometricLock: false,
	pinLockEnabled: false,
	passcode: "123456",
	autoLockTimeout: "immediately",
	privacyBlurEnabled: true,
	autoPrivacyModeOnLaunch: false,
	showWalletsOnHome: true,
	firstDayOfMonth: 1,
	budgetNotificationThreshold: 80,
	hasCompletedOnboarding: true,
	isDemoInitialized: true
};
export function createDefaultBudget() {
	const now = /* @__PURE__ */ new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const monthStr = String(month + 1).padStart(2, "0");
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const pStart = `${year}-${monthStr}-01`;
	const pEnd = `${year}-${monthStr}-${String(daysInMonth).padStart(2, "0")}`;
	return {
		id: `bgt-${year}-${monthStr}`,
		periodStart: pStart,
		periodEnd: pEnd,
		amount: 0,
		createdAt: `${pStart}T00:00:00Z`,
		updatedAt: `${pStart}T00:00:00Z`
	};
}
export const DEFAULT_BUDGET = createDefaultBudget();
export class LocalDatabase {
	constructor() {
		this.db = null;
		this.dbPromise = null;
	}
	async openDB() {
		if (this.db) return this.db;
		if (this.dbPromise) return this.dbPromise;
		this.dbPromise = new Promise((resolve, reject) => {
			const idb = typeof indexedDB !== "undefined" ? indexedDB : typeof window !== "undefined" ? window.indexedDB : null;
			if (!idb) {
				reject(/* @__PURE__ */ new Error("IndexedDB is not supported"));
				return;
			}
			const request = idb.open(DB_NAME, DB_VERSION);
			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				if (!db.objectStoreNames.contains("expenses")) {
					const expenseStore = db.createObjectStore("expenses", { keyPath: "id" });
					expenseStore.createIndex("date", "date", { unique: false });
					expenseStore.createIndex("categoryId", "categoryId", { unique: false });
					expenseStore.createIndex("accountId", "accountId", { unique: false });
					expenseStore.createIndex("type", "type", { unique: false });
					expenseStore.createIndex("isDeleted", "isDeleted", { unique: false });
				}
				if (!db.objectStoreNames.contains("categories")) {
					const categoryStore = db.createObjectStore("categories", { keyPath: "id" });
					categoryStore.createIndex("isActive", "isActive", { unique: false });
					categoryStore.createIndex("sortOrder", "sortOrder", { unique: false });
				}
				if (!db.objectStoreNames.contains("budgets")) db.createObjectStore("budgets", { keyPath: "id" });
				if (!db.objectStoreNames.contains("accounts")) db.createObjectStore("accounts", { keyPath: "id" });
				if (!db.objectStoreNames.contains("recurring")) db.createObjectStore("recurring", { keyPath: "id" }).createIndex("isActive", "isActive", { unique: false });
				if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "id" });
			};
			request.onsuccess = async (event) => {
				this.db = event.target.result;
				try {
					await this.initializeDefaultsIfNeeded();
				} catch (initErr) {
					console.warn("Non-destructive initialization check warning:", initErr);
				}
				resolve(this.db);
			};
			request.onerror = (event) => {
				console.error("IndexedDB error:", event.target.error);
				reject(event.target.error);
			};
		});
		return this.dbPromise;
	}
	async initializeDefaultsIfNeeded() {
		if (typeof navigator !== "undefined" && navigator.storage && typeof navigator.storage.persist === "function") try {
			await navigator.storage.persist();
		} catch {}
		const [existingExpenses, existingAccounts, existingCategories, existingBudgets, existingRecurring] = await Promise.all([
			this.getAll("expenses"),
			this.getAll("accounts"),
			this.getAll("categories"),
			this.getAll("budgets"),
			this.getAll("recurring")
		]);
		let settings = await this.get("settings", "current");
		if (!settings) {
			existingExpenses.length > 0 || existingAccounts.length > 0 || existingCategories.length > 0 || existingBudgets.some((b) => b.amount > 0) || existingRecurring.length;
			settings = {
				...DEFAULT_SETTINGS,
				hasCompletedOnboarding: true,
				isDemoInitialized: true
			};
			await this.put("settings", {
				...settings,
				id: "current"
			});
		}
		if (existingBudgets.length === 0) await this.put("budgets", DEFAULT_BUDGET);
		if (existingCategories.length === 0) {
			for (const cat of DEFAULT_CATEGORIES) {
				await this.put("categories", cat);
			}
		}
		if (existingAccounts.length === 0) {
			for (const acc of DEFAULT_ACCOUNTS) {
				await this.put("accounts", acc);
			}
		}
	}
	/**
	* Reset application data to empty state.
	* STRICT SAFETY RULE: Must ONLY be called upon explicit, confirmed user reset action from Settings.
	* NEVER call this automatically on startup, upgrade, or missing metadata.
	*/
	async zeroOutApp() {
		const db = await this.openDB();
		const storeNames = [
			"expenses",
			"recurring",
			"accounts",
			"budgets"
		];
		return new Promise((resolve, reject) => {
			const tx = db.transaction(storeNames, "readwrite");
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			tx.onabort = () => reject(tx.error);
			try {
				tx.objectStore("expenses").clear();
				tx.objectStore("recurring").clear();
				const accReq = tx.objectStore("accounts").openCursor();
				accReq.onsuccess = (e) => {
					const cursor = e.target.result;
					if (cursor) {
						cursor.update({
							...cursor.value,
							openingBalance: 0
						});
						cursor.continue();
					}
				};
				const bgtReq = tx.objectStore("budgets").openCursor();
				bgtReq.onsuccess = (e) => {
					const cursor = e.target.result;
					if (cursor) {
						cursor.update({
							...cursor.value,
							amount: 0
						});
						cursor.continue();
					}
				};
			} catch (err) {
				try {
					tx.abort();
				} catch (_) {}
				reject(err);
			}
		});
	}
	async getAll(storeName) {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const request = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
			request.onsuccess = () => resolve(request.result || []);
			request.onerror = () => reject(request.error);
		});
	}
	async get(storeName, key) {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const request = db.transaction(storeName, "readonly").objectStore(storeName).get(key);
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}
	async put(storeName, value) {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const request = db.transaction(storeName, "readwrite").objectStore(storeName).put(value);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
	async delete(storeName, key) {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const request = db.transaction(storeName, "readwrite").objectStore(storeName).delete(key);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
	async clearStore(storeName) {
		const db = await this.openDB();
		return new Promise((resolve, reject) => {
			const request = db.transaction(storeName, "readwrite").objectStore(storeName).clear();
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
	async getAllExpenses(includeDeleted = false) {
		const all = await this.getAll("expenses");
		return includeDeleted ? all : all.filter((e) => !e.isDeleted);
	}
	async getExpenses(includeDeleted = false) {
		return this.getAllExpenses(includeDeleted);
	}
	async getExpenseById(id) {
		const exp = await this.get("expenses", id);
		return exp && !exp.isDeleted ? exp : void 0;
	}
	async getExpensesByDateRange(startDate, endDate, includeDeleted = false) {
		return (await this.getAllExpenses(includeDeleted)).filter((e) => e.date >= startDate && e.date <= endDate);
	}
	async getExpensesByCategory(categoryId, includeDeleted = false) {
		return (await this.getAllExpenses(includeDeleted)).filter((e) => e.categoryId === categoryId);
	}
	async getRecentExpenses(limit = 5) {
		return (await this.getAllExpenses(false)).sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)).slice(0, limit);
	}
	async searchExpenses(query, includeDeleted = false) {
		const q = query.toLowerCase().trim();
		if (!q) return this.getAllExpenses(includeDeleted);
		return (await this.getAllExpenses(includeDeleted)).filter((e) => e.note.toLowerCase().includes(q) || e.merchant.toLowerCase().includes(q) || e.paymentMethodId.toLowerCase().includes(q));
	}
	async getMonthlyExpenses(yearMonth, includeDeleted = false) {
		return (await this.getAllExpenses(includeDeleted)).filter((e) => e.date.startsWith(yearMonth));
	}
	async getDailyExpenses(date, includeDeleted = false) {
		return (await this.getAllExpenses(includeDeleted)).filter((e) => e.date === date);
	}
	async getPaginatedExpenses(options) {
		const page = Math.max(1, options.page || 1);
		const pageSize = Math.max(1, Math.min(100, options.limit || 20));
		let list = await this.getAllExpenses(false);
		if (options.search?.trim()) {
			const q = options.search.toLowerCase().trim();
			list = list.filter((e) => e.note.toLowerCase().includes(q) || e.merchant.toLowerCase().includes(q));
		}
		if (options.type && options.type !== "all") list = list.filter((e) => e.type === options.type);
		if (options.categoryIds && options.categoryIds.length > 0) list = list.filter((e) => options.categoryIds.includes(e.categoryId));
		if (options.startDate) list = list.filter((e) => e.date >= options.startDate);
		if (options.endDate) list = list.filter((e) => e.date <= options.endDate);
		const sortBy = options.sortBy || "newest";
		list.sort((a, b) => {
			if (sortBy === "newest") return `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`);
			if (sortBy === "oldest") return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
			if (sortBy === "highest") return b.amount - a.amount;
			if (sortBy === "lowest") return a.amount - b.amount;
			return 0;
		});
		const total = list.length;
		const totalPages = Math.ceil(total / pageSize) || 1;
		const startIndex = (page - 1) * pageSize;
		return {
			data: list.slice(startIndex, startIndex + pageSize),
			total,
			page,
			pageSize,
			totalPages,
			hasMore: page < totalPages
		};
	}
	async addExpense(expense) {
		if (expense.amount <= 0 || isNaN(expense.amount) || !isFinite(expense.amount)) throw new Error("Expense amount must be a positive valid number");
		const cleanAmount = Math.round(expense.amount * 100) / 100;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const newExpense = {
			...expense,
			amount: cleanAmount,
			currency: expense.currency || "EGP",
			paymentMethod: expense.paymentMethod || expense.paymentMethodId || "acc-card",
			paymentMethodId: expense.paymentMethodId || "acc-card",
			id: expense.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
			createdAt: now,
			updatedAt: now,
			isDeleted: false
		};
		await this.put("expenses", newExpense);
		return newExpense;
	}
	async updateExpense(id, updates) {
		const existing = await this.get("expenses", id);
		if (!existing) throw new Error(`Expense with ID ${id} not found`);
		let cleanAmount = existing.amount;
		if (updates.amount !== void 0) {
			if (updates.amount <= 0 || isNaN(updates.amount) || !isFinite(updates.amount)) throw new Error("Expense amount must be a positive valid number");
			cleanAmount = Math.round(updates.amount * 100) / 100;
		}
		const updated = {
			...existing,
			...updates,
			amount: cleanAmount,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await this.put("expenses", updated);
		return updated;
	}
	async deleteExpense(id, soft = true) {
		if (soft) await this.updateExpense(id, { isDeleted: true });
		else await this.delete("expenses", id);
	}
	async restoreExpense(id) {
		return await this.updateExpense(id, { isDeleted: false });
	}
	async getCategories() {
		return (await this.getAll("categories")).sort((a, b) => a.sortOrder - b.sortOrder);
	}
	async saveCategory(category) {
		if (!category.name || !category.name.trim()) throw new Error("Category name cannot be empty");
		const cleanCategory = {
			...category,
			name: category.name.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await this.put("categories", cleanCategory);
	}
	async deleteCategory(id) {
		await this.delete("categories", id);
	}
	async getBudget(periodMonth = `${(/* @__PURE__ */ new Date()).getFullYear()}-${String((/* @__PURE__ */ new Date()).getMonth() + 1).padStart(2, "0")}`) {
		const match = (await this.getAll("budgets")).find((b) => b.periodStart.startsWith(periodMonth));
		if (match) return match;
		const now = /* @__PURE__ */ new Date();
		const parts = periodMonth.split("-");
		const year = parseInt(parts[0], 10) || now.getFullYear();
		const month = parseInt(parts[1], 10) || now.getMonth() + 1;
		const daysInMonth = new Date(year, month, 0).getDate();
		return {
			id: `bgt-${periodMonth}`,
			periodStart: `${periodMonth}-01`,
			periodEnd: `${periodMonth}-${String(daysInMonth).padStart(2, "0")}`,
			amount: 2e4,
			currency: "EGP",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	}
	async getAllBudgets() {
		return await this.getAll("budgets");
	}
	async saveBudget(budget) {
		await this.put("budgets", {
			...budget,
			amount: Math.round(budget.amount * 100) / 100,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	}
	async getAccounts() {
		return await this.getAll("accounts");
	}
	async saveAccount(account) {
		await this.put("accounts", account);
	}
	async deleteAccount(id) {
		await this.delete("accounts", id);
	}
	async updateAccount(id, updates) {
		const existing = await this.get("accounts", id);
		if (!existing) throw new Error("Account not found");
		const updated = {
			...existing,
			...updates,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await this.put("accounts", updated);
		return updated;
	}
	async getRecurring() {
		return await this.getAll("recurring");
	}
	async saveRecurring(rec) {
		await this.put("recurring", rec);
	}
	async deleteRecurring(id) {
		await this.delete("recurring", id);
	}
	async getSettings() {
		return await this.get("settings", "current") || DEFAULT_SETTINGS;
	}
	async saveSettings(settings) {
		await this.put("settings", {
			...settings,
			id: "current"
		});
	}
	async clearAllUserData() {
		await this.clearStore("expenses");
		await this.clearStore("recurring");
	}
	async restoreFullBackup(backup) {
		if (!backup || !Array.isArray(backup.expenses) || !Array.isArray(backup.categories) || !Array.isArray(backup.accounts) || !Array.isArray(backup.recurring)) throw new Error("بيانات النسخة الاحتياطية غير صالحة ولا تحتوي على المجموعات الإلزامية");
		const db = await this.openDB();
		const storeNames = [
			"expenses",
			"categories",
			"budgets",
			"accounts",
			"recurring",
			"settings"
		];
		return new Promise((resolve, reject) => {
			let isSettled = false;
			const tx = db.transaction(storeNames, "readwrite");
			tx.onerror = (event) => {
				if (!isSettled) {
					isSettled = true;
					const err = event.target?.error || tx.error;
					reject(new Error(err?.message || "فشلت عملية استعادة النسخة الاحتياطية أثناء كتابة البيانات"));
				}
			};
			tx.onabort = (event) => {
				if (!isSettled) {
					isSettled = true;
					const err = event.target?.error || tx.error;
					reject(new Error(err?.message || "تم التراجع عن استعادة النسخة الاحتياطية للحفاظ على البيانات الأصلية"));
				}
			};
			tx.oncomplete = () => {
				if (!isSettled) {
					isSettled = true;
					resolve();
				}
			};
			try {
				const expStore = tx.objectStore("expenses");
				const catStore = tx.objectStore("categories");
				const bgtStore = tx.objectStore("budgets");
				const accStore = tx.objectStore("accounts");
				const recStore = tx.objectStore("recurring");
				const setStore = tx.objectStore("settings");
				expStore.clear();
				catStore.clear();
				bgtStore.clear();
				accStore.clear();
				recStore.clear();
				setStore.clear();
				for (const exp of backup.expenses) expStore.put(exp);
				for (const cat of backup.categories) catStore.put(cat);
				if (backup.budget) bgtStore.put(backup.budget);
				for (const acc of backup.accounts) accStore.put(acc);
				for (const rec of backup.recurring) recStore.put(rec);
				if (backup.settings) setStore.put({
					...backup.settings,
					id: "current"
				});
			} catch (err) {
				try {
					tx.abort();
				} catch (_) {}
				if (!isSettled) {
					isSettled = true;
					reject(err);
				}
			}
		});
	}
	async resetToEmpty() {
		await this.zeroOutApp();
	}
};
export const localDB = new LocalDatabase();

export default localDB;
