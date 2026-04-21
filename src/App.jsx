import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2,
  Plus,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart as PieChartIcon,
  TrendingUp,
  ReceiptText,
  Repeat,
  Shuffle,
  Sparkles,
  Pencil,
  Download,
  FileText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const incomeCategories = ["משכורת", "עסק", "השקעות", "החזר", "אחר"];
const expenseCategories = ["מזון", "דיור", "תחבורה", "בילויים", "חשבונות", "בריאות", "חינוך", "קניות", "אחר"];
const recurrenceOptions = [
  { value: "fixed", label: "קבועה" },
  { value: "variable", label: "משתנה" },
];

const initialTransactions = [
  {
    id: 1,
    type: "income",
    title: "משכורת חודשית",
    category: "משכורת",
    amount: 12500,
    date: "2026-04-02",
    recurrence: "fixed",
  },
  {
    id: 2,
    type: "expense",
    title: "סופרמרקט",
    category: "מזון",
    amount: 860,
    date: "2026-04-04",
    recurrence: "variable",
  },
  {
    id: 3,
    type: "expense",
    title: "שכר דירה",
    category: "דיור",
    amount: 4200,
    date: "2026-04-05",
    recurrence: "fixed",
  },
  {
    id: 4,
    type: "income",
    title: "הכנסה מפרויקט",
    category: "עסק",
    amount: 3400,
    date: "2026-04-08",
    recurrence: "variable",
  },
  {
    id: 5,
    type: "expense",
    title: "דלק ורכב",
    category: "תחבורה",
    amount: 540,
    date: "2026-04-11",
    recurrence: "variable",
  },
  {
    id: 6,
    type: "expense",
    title: "מסעדה",
    category: "בילויים",
    amount: 290,
    date: "2026-04-13",
    recurrence: "variable",
  },
];

const chartColors = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c", "#0891b2", "#ca8a04", "#4f46e5", "#64748b"];
const STORAGE_KEY = "financial-platform-hebrew-rtl-data-v2";
const USER_STORAGE_KEY = "financial-platform-user";

function formatCurrency(value) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(dateString));
}

function monthKey(dateString) {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(dateString) {
  const d = new Date(dateString);
  return new Intl.DateTimeFormat("he-IL", { month: "short", year: "numeric" }).format(d);
}

function loadSavedAppState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function SummaryCard({ title, value, icon, subtitle, positive }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-2xl border-0 bg-white/90 shadow-lg backdrop-blur">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{title}</p>
              <h3
                className={`mt-2 text-2xl font-bold ${
                  positive === false ? "text-red-600" : positive === true ? "text-green-600" : "text-slate-900"
                }`}
              >
                {value}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export default function FinancialPlatformHebrewRTL() {
  const savedState = loadSavedAppState();

  const [transactions, setTransactions] = useState(
    savedState?.transactions?.length ? savedState.transactions : initialTransactions
  );
  const [type, setType] = useState(savedState?.type || "expense");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(savedState?.category || expenseCategories[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(savedState?.date || new Date().toISOString().slice(0, 10));
  const [recurrence, setRecurrence] = useState(savedState?.recurrence || "variable");
  const [filterType, setFilterType] = useState(savedState?.filterType || "all");
  const [filterMonth, setFilterMonth] = useState(savedState?.filterMonth || "all");
  const [filterRecurrence, setFilterRecurrence] = useState(savedState?.filterRecurrence || "all");
  const [editingId, setEditingId] = useState(null);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(USER_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const availableCategories = type === "income" ? incomeCategories : expenseCategories;

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loggedInUser) {
      window.localStorage.setItem(USER_STORAGE_KEY, loggedInUser);
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        transactions,
        type,
        category,
        date,
        recurrence,
        filterType,
        filterMonth,
        filterRecurrence,
      })
    );
  }, [transactions, type, category, date, recurrence, filterType, filterMonth, filterRecurrence]);

  const monthOptions = useMemo(() => {
    const keys = Array.from(new Set(transactions.map((t) => monthKey(t.date)))).sort().reverse();
    return keys.map((key) => {
      const sample = transactions.find((t) => monthKey(t.date) === key);
      return { key, label: sample ? monthLabel(sample.date) : key };
    });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const typeMatch = filterType === "all" || t.type === filterType;
      const monthMatch = filterMonth === "all" || monthKey(t.date) === filterMonth;
      const recurrenceMatch = filterRecurrence === "all" || t.recurrence === filterRecurrence;
      return typeMatch && monthMatch && recurrenceMatch;
    });
  }, [transactions, filterType, filterMonth, filterRecurrence]);

  const summary = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const expenseByCategory = useMemo(() => {
    const map = new Map();
    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const grouped = new Map();
    [...transactions]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((t) => {
        const key = monthKey(t.date);
        const label = monthLabel(t.date);
        if (!grouped.has(key)) grouped.set(key, { month: label, הכנסות: 0, הוצאות: 0 });
        const row = grouped.get(key);
        if (t.type === "income") row["הכנסות"] += t.amount;
        else row["הוצאות"] += t.amount;
      });
    return Array.from(grouped.values());
  }, [transactions]);

  const latestTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setType("expense");
    setCategory(expenseCategories[0]);
    setRecurrence("variable");
  }

  function saveTransaction() {
    if (!title.trim() || !amount || Number(amount) <= 0 || !date || !category) return;

    const payload = {
      type,
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      recurrence,
    };

    if (editingId) {
      setTransactions((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...payload } : t)));
    } else {
      setTransactions((prev) => [{ id: Date.now(), ...payload }, ...prev]);
    }

    resetForm();
  }

  function startEditTransaction(transaction) {
    setEditingId(transaction.id);
    setType(transaction.type);
    setTitle(transaction.title);
    setCategory(transaction.category);
    setAmount(String(transaction.amount));
    setDate(transaction.date);
    setRecurrence(transaction.recurrence || "variable");
  }

  function removeTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) resetForm();
  }

  function onTypeChange(nextType) {
    setType(nextType);
    setCategory(nextType === "income" ? incomeCategories[0] : expenseCategories[0]);
  }

  function handleLogin() {
    if (!userEmail.trim() || !userPassword.trim()) return;
    setLoggedInUser(userEmail.trim());
    setUserPassword("");
  }

  function handleRegister() {
    if (!userEmail.trim() || !userPassword.trim()) return;
    setLoggedInUser(userEmail.trim());
    setUserPassword("");
  }

  function handleLogout() {
    setLoggedInUser(null);
    setUserEmail("");
    setUserPassword("");
  }

  function resetAllData() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setTransactions(initialTransactions);
    setFilterType("all");
    setFilterMonth("all");
    setFilterRecurrence("all");
    resetForm();
  }

  function exportToCSV() {
    const headers = ["תאריך", "תיאור", "סוג", "קטגוריה", "אופי", "סכום"];
    const rows = filteredTransactions.map((t) => [
      formatDate(t.date),
      t.title,
      t.type === "income" ? "הכנסה" : "הוצאה",
      t.category,
      t.recurrence === "fixed" ? "קבועה" : "משתנה",
      t.amount,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("
");

    const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financial-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  function printMonthlyReport() {
    window.print();
  }

  async function installApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstallButton(false);
  }

  function createCurrentMonthFromFixedTransactions() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const fixedTransactions = transactions.filter((t) => t.recurrence === "fixed");

    const alreadyExistingKeys = new Set(
      transactions
        .filter((t) => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .map((t) => `${t.title}-${t.category}-${t.type}-${t.amount}-${t.recurrence}`)
    );

    const newMonthlyTransactions = fixedTransactions
      .filter((t) => {
        const key = `${t.title}-${t.category}-${t.type}-${t.amount}-${t.recurrence}`;
        const d = new Date(t.date);
        const alreadyInCurrentMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        return !alreadyInCurrentMonth && !alreadyExistingKeys.has(key);
      })
      .map((t, index) => ({
        ...t,
        id: Date.now() + index,
        date: new Date(currentYear, currentMonth, Math.min(new Date(t.date).getDate(), 28)).toISOString().slice(0, 10),
      }));

    if (newMonthlyTransactions.length) {
      setTransactions((prev) => [...newMonthlyTransactions, ...prev]);
      setFilterMonth(`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 overflow-hidden rounded-[28px] bg-slate-900 p-6 text-white shadow-2xl md:p-8"
        >
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge className="rounded-full bg-white/15 px-3 py-1 text-white hover:bg-white/15">פלטפורמה פיננסית חכמה</Badge>
                {showInstallButton && (
                  <Button
                    onClick={installApp}
                    size="sm"
                    variant="secondary"
                    className="rounded-full bg-white text-slate-900 hover:bg-slate-100"
                  >
                    התקן כאפליקציה
                  </Button>
                )}
              </div>
              <h1 className="text-2xl font-bold leading-tight md:text-5xl">ניהול כספים בעברית, בצורה ברורה ומקצועית</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base md:leading-7">
                מעקב אחר הכנסות והוצאות, ניתוח קטגוריות, תזרים מזומנים חודשי ודשבורד אחד שמרכז את כל מה שחשוב.
              </p>
            </div>
            <div className="grid gap-3 rounded-3xl bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <span className="text-sm text-slate-200">יתרה נוכחית</span>
                <span className="text-xl font-bold">{formatCurrency(summary.balance)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-200">הכנסות</p>
                  <p className="mt-2 text-lg font-bold">{formatCurrency(summary.income)}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-200">הוצאות</p>
                  <p className="mt-2 text-lg font-bold">{formatCurrency(summary.expense)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <Card className="mb-6 rounded-3xl border-0 bg-white shadow-lg">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">אזור משתמש</p>
                <h2 className="text-xl font-bold">התחברות / הרשמה</h2>
                <p className="mt-1 text-sm text-slate-500">שלב ראשון לגרסה מסחרית עם משתמשים אישיים וסנכרון עתידי בענן</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {loggedInUser ? (
                  <>
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      מחובר כעת: <span className="font-semibold">{loggedInUser}</span>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="rounded-2xl">
                      התנתקות
                    </Button>
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="אימייל"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-[220px] rounded-xl"
                    />
                    <Input
                      type="password"
                      placeholder="סיסמה"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-[220px] rounded-xl"
                    />
                    <Button onClick={handleLogin} className="rounded-2xl">
                      התחברות
                    </Button>
                    <Button onClick={handleRegister} variant="outline" className="rounded-2xl">
                      הרשמה
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="sticky top-2 z-20 grid w-full grid-cols-3 rounded-2xl bg-white p-1 shadow-md">
            <TabsTrigger value="dashboard" className="rounded-xl">
              דשבורד
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-xl">
              עסקאות
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl">
              דוחות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="סך הכנסות"
                value={formatCurrency(summary.income)}
                subtitle="לפי הסינון הנוכחי"
                icon={<ArrowUpCircle className="h-6 w-6" />}
                positive
              />
              <SummaryCard
                title="סך הוצאות"
                value={formatCurrency(summary.expense)}
                subtitle="לפי הסינון הנוכחי"
                icon={<ArrowDownCircle className="h-6 w-6" />}
                positive={false}
              />
              <SummaryCard
                title="יתרה"
                value={formatCurrency(summary.balance)}
                subtitle="הכנסות פחות הוצאות"
                icon={<Wallet className="h-6 w-6" />}
              />
              <SummaryCard
                title="מספר עסקאות"
                value={String(summary.count)}
                subtitle="רשומות פעילות במערכת"
                icon={<ReceiptText className="h-6 w-6" />}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xl">עסקאות אחרונות</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {latestTransactions.length === 0 ? (
                    <EmptyState title="אין עדיין עסקאות להצגה" text="הוסף עסקה חדשה כדי להתחיל לנהל את הכספים שלך." />
                  ) : (
                    <div className="space-y-3">
                      {latestTransactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-semibold">{t.title}</p>
                              <Badge variant="secondary" className="rounded-full">
                                {t.type === "income" ? "הכנסה" : "הוצאה"}
                              </Badge>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                              <span>
                                {t.category} · {formatDate(t.date)}
                              </span>
                              <Badge variant="outline" className="rounded-full bg-white">
                                {t.recurrence === "fixed" ? "קבועה" : "משתנה"}
                              </Badge>
                            </div>
                          </div>
                          <p className={`text-lg font-bold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                            {t.type === "income" ? "+" : "-"}
                            {formatCurrency(t.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xl">חלוקת הוצאות לפי קטגוריה</CardTitle>
                </CardHeader>
                <CardContent className="h-[380px] pt-6">
                  {expenseByCategory.length === 0 ? (
                    <EmptyState title="אין נתוני הוצאות" text="כשתוסיף הוצאות, כאן תופיע התפלגות לפי קטגוריה." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                          {expenseByCategory.map((entry, index) => (
                            <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Plus className="h-5 w-5" />
                    {editingId ? "עריכת עסקה" : "הוספת עסקה חדשה"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>סוג עסקה</Label>
                    <Select value={type} onValueChange={onTypeChange}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">הכנסה</SelectItem>
                        <SelectItem value="expense">הוצאה</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>תיאור</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="למשל: משכורת / קניות / תשלום מספק"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>קטגוריה</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>סכום</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="הזן סכום"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>תאריך</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
                  </div>

                  <div className="grid gap-2">
                    <Label>אופי העסקה</Label>
                    <Select value={recurrence} onValueChange={setRecurrence}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {recurrenceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveTransaction} className="w-full rounded-2xl text-base">
                      {editingId ? "עדכן עסקה" : "שמור עסקה"}
                    </Button>
                    {editingId && (
                      <Button onClick={resetForm} variant="outline" className="rounded-2xl">
                        ביטול
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-xl">רשימת עסקאות</CardTitle>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[170px] rounded-xl bg-white">
                        <SelectValue placeholder="סינון לפי סוג" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל הסוגים</SelectItem>
                        <SelectItem value="income">הכנסות בלבד</SelectItem>
                        <SelectItem value="expense">הוצאות בלבד</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterMonth} onValueChange={setFilterMonth}>
                      <SelectTrigger className="w-[170px] rounded-xl bg-white">
                        <SelectValue placeholder="סינון לפי חודש" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל החודשים</SelectItem>
                        {monthOptions.map((m) => (
                          <SelectItem key={m.key} value={m.key}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterRecurrence} onValueChange={setFilterRecurrence}>
                      <SelectTrigger className="w-[170px] rounded-xl bg-white">
                        <SelectValue placeholder="סינון לפי אופי" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">קבועה + משתנה</SelectItem>
                        <SelectItem value="fixed">קבועה בלבד</SelectItem>
                        <SelectItem value="variable">משתנה בלבד</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Button onClick={createCurrentMonthFromFixedTransactions} variant="outline" className="rounded-2xl">
                      <Sparkles className="ml-2 h-4 w-4" />
                      צור לחודש הנוכחי עסקאות קבועות
                    </Button>
                    <Button onClick={exportToCSV} variant="outline" className="rounded-2xl">
                      <Download className="ml-2 h-4 w-4" />
                      ייצוא ל-CSV
                    </Button>
                    <Button onClick={printMonthlyReport} variant="outline" className="rounded-2xl">
                      <FileText className="ml-2 h-4 w-4" />
                      דוח חודשי להדפסה
                    </Button>
                    <Button
                      onClick={resetAllData}
                      variant="outline"
                      className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      אפס נתונים
                    </Button>
                  </div>

                  {filteredTransactions.length === 0 ? (
                    <EmptyState title="לא נמצאו עסקאות" text="נסה לשנות את הסינון או להוסיף עסקה חדשה." />
                  ) : (
                    <ScrollArea className="h-[420px] pr-1 md:h-[520px]">
                      <div className="space-y-3">
                        {[...filteredTransactions]
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((t) => (
                            <motion.div
                              key={t.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-slate-900">{t.title}</p>
                                  <Badge
                                    className={`rounded-full ${
                                      t.type === "income"
                                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                                        : "bg-red-100 text-red-700 hover:bg-red-100"
                                    }`}
                                  >
                                    {t.type === "income" ? "הכנסה" : "הוצאה"}
                                  </Badge>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                  <span>
                                    {t.category} · {formatDate(t.date)}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`rounded-full ${
                                      t.recurrence === "fixed"
                                        ? "border-blue-200 bg-blue-50 text-blue-700"
                                        : "border-amber-200 bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    <span className="flex items-center gap-1">
                                      {t.recurrence === "fixed" ? <Repeat className="h-3.5 w-3.5" /> : <Shuffle className="h-3.5 w-3.5" />}
                                      {t.recurrence === "fixed" ? "קבועה" : "משתנה"}
                                    </span>
                                  </Badge>
                                </div>
                              </div>
                              <div className="mr-4 flex items-center gap-3">
                                <p className={`min-w-[120px] text-left text-lg font-bold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                                  {t.type === "income" ? "+" : "-"}
                                  {formatCurrency(t.amount)}
                                </p>
                                <Button variant="outline" size="icon" className="rounded-xl" onClick={() => startEditTransaction(t)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-xl">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="rounded-3xl">
                                    <DialogHeader>
                                      <DialogTitle>למחוק את העסקה?</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 text-sm text-slate-600">
                                      <p>
                                        העסקה <span className="font-semibold">{t.title}</span> תוסר מהרשימה.
                                      </p>
                                      <div className="flex justify-end gap-3">
                                        <Button variant="outline" className="rounded-xl">
                                          ביטול
                                        </Button>
                                        <Button variant="destructive" className="rounded-xl" onClick={() => removeTransaction(t.id)}>
                                          מחיקה
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="h-5 w-5" />
                    מגמת הכנסות מול הוצאות
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[420px]">
                  {monthlyData.length === 0 ? (
                    <EmptyState title="אין מספיק נתונים לדוח" text="הוסף עסקאות במספר חודשים כדי לראות מגמה." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="הכנסות" radius={[8, 8, 0, 0]} fill="#16a34a" />
                        <Bar dataKey="הוצאות" radius={[8, 8, 0, 0]} fill="#dc2626" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <PieChartIcon className="h-5 w-5" />
                    תובנות מרכזיות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">היתרה הנוכחית</p>
                    <p className="mt-2 text-3xl font-bold">{formatCurrency(summary.balance)}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-green-50 p-5">
                      <p className="text-sm text-green-700">הכנסה ממוצעת לעסקה</p>
                      <p className="mt-2 text-2xl font-bold text-green-800">
                        {formatCurrency(
                          (() => {
                            const rows = filteredTransactions.filter((t) => t.type === "income");
                            return rows.length ? rows.reduce((sum, t) => sum + t.amount, 0) / rows.length : 0;
                          })()
                        )}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-red-50 p-5">
                      <p className="text-sm text-red-700">הוצאה ממוצעת לעסקה</p>
                      <p className="mt-2 text-2xl font-bold text-red-800">
                        {formatCurrency(
                          (() => {
                            const rows = filteredTransactions.filter((t) => t.type === "expense");
                            return rows.length ? rows.reduce((sum, t) => sum + t.amount, 0) / rows.length : 0;
                          })()
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">הקטגוריה המובילה בהוצאות</p>
                    <p className="mt-2 text-xl font-bold">
                      {expenseByCategory.length ? [...expenseByCategory].sort((a, b) => b.value - a.value)[0].name : "אין עדיין נתונים"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">סטטוס מהיר</p>
                    <p className="mt-2 text-base leading-7 text-slate-700">
                      {summary.balance >= 0
                        ? "המצב הכספי הנוכחי חיובי. ניתן להמשיך לעקוב אחר דפוסי ההוצאות ולזהות הזדמנויות לחיסכון נוסף."
                        : "כרגע ההוצאות גבוהות מההכנסות במסגרת הסינון הנוכחי. מומלץ לבדוק אילו קטגוריות מכבידות ביותר."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
