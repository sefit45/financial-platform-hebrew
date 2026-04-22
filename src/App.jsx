import React, { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  ReceiptText,
  Repeat,
  Shuffle,
  Sparkles,
  Pencil,
  Trash2,
  Download,
  FileText,
  TrendingUp,
  PieChart as PieChartIcon,
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

const incomeCategories = ["משכורת", "עסק", "השקעות", "החזר", "אחר"];
const expenseCategories = [
  "מזון",
  "דיור",
  "תחבורה",
  "בילויים",
  "חשבונות",
  "בריאות",
  "חינוך",
  "קניות",
  "אחר",
];

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

const defaultBudgets = {
  מזון: 2500,
  דיור: 4500,
  תחבורה: 1200,
  בילויים: 1000,
  חשבונות: 1500,
  בריאות: 800,
  חינוך: 1200,
  קניות: 1500,
  אחר: 1000,
};

const STORAGE_KEY = "financial-platform-hebrew-data-v1";
const USER_STORAGE_KEY = "financial-platform-user-v1";

const chartColors = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#4f46e5",
  "#64748b",
];

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
  return new Intl.DateTimeFormat("he-IL", {
    month: "short",
    year: "numeric",
  }).format(d);
}

function cardStyle() {
  return {
    background: "#fff",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
    border: "1px solid #e2e8f0",
  };
}

function buttonStyle(kind = "primary") {
  const common = {
    borderRadius: 14,
    padding: "10px 14px",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  };

  if (kind === "outline") {
    return {
      ...common,
      background: "#fff",
      color: "#0f172a",
      border: "1px solid #cbd5e1",
    };
  }

  if (kind === "danger") {
    return {
      ...common,
      background: "#dc2626",
      color: "#fff",
    };
  }

  return {
    ...common,
    background: "#0f172a",
    color: "#fff",
  };
}

function inputStyle() {
  return {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    padding: "10px 12px",
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
  };
}

function SummaryCard({ title, value, icon, subtitle, color }) {
  return (
    <div style={cardStyle()}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ color: "#64748b", fontSize: 14 }}>{title}</div>
          <div
            style={{
              marginTop: 8,
              fontSize: 28,
              fontWeight: 700,
              color: color || "#0f172a",
            }}
          >
            {value}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
            {subtitle}
          </div>
        </div>
        <div
          style={{
            background: "#f1f5f9",
            borderRadius: 16,
            padding: 12,
            color: "#334155",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialTransactions;
      const parsed = JSON.parse(saved);
      return parsed.transactions || initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultBudgets;
      const parsed = JSON.parse(saved);
      return parsed.budgets || defaultBudgets;
    } catch {
      return defaultBudgets;
    }
  });

  const [type, setType] = useState("expense");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(expenseCategories[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [recurrence, setRecurrence] = useState("variable");
  const [editingId, setEditingId] = useState(null);

  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterRecurrence, setFilterRecurrence] = useState("all");

  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      return localStorage.getItem(USER_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        transactions,
        budgets,
      })
    );
  }, [transactions, budgets]);

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem(USER_STORAGE_KEY, loggedInUser);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [loggedInUser]);

  const availableCategories =
    type === "income" ? incomeCategories : expenseCategories;

  const monthOptions = useMemo(() => {
    const keys = Array.from(new Set(transactions.map((t) => monthKey(t.date))))
      .sort()
      .reverse();

    return keys.map((key) => {
      const sample = transactions.find((t) => monthKey(t.date) === key);
      return {
        key,
        label: sample ? monthLabel(sample.date) : key,
      };
    });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const typeMatch = filterType === "all" || t.type === filterType;
      const monthMatch =
        filterMonth === "all" || monthKey(t.date) === filterMonth;
      const recurrenceMatch =
        filterRecurrence === "all" || t.recurrence === filterRecurrence;
      return typeMatch && monthMatch && recurrenceMatch;
    });
  }, [transactions, filterType, filterMonth, filterRecurrence]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

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

        if (!grouped.has(key)) {
          grouped.set(key, { month: label, הכנסות: 0, הוצאות: 0 });
        }

        const row = grouped.get(key);
        if (t.type === "income") row["הכנסות"] += t.amount;
        else row["הוצאות"] += t.amount;
      });

    return Array.from(grouped.values());
  }, [transactions]);

  const budgetStatus = useMemo(() => {
    return expenseCategories.map((categoryName) => {
      const spent = filteredTransactions
        .filter((t) => t.type === "expense" && t.category === categoryName)
        .reduce((sum, t) => sum + t.amount, 0);

      const budget = Number(budgets[categoryName] || 0);
      const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;

      return {
        category: categoryName,
        spent,
        budget,
        remaining: budget - spent,
        percent,
        overBudget: budget > 0 && spent > budget,
      };
    });
  }, [filteredTransactions, budgets]);

  const latestTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  function resetForm() {
    setEditingId(null);
    setType("expense");
    setTitle("");
    setCategory(expenseCategories[0]);
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setRecurrence("variable");
  }

  function saveTransaction() {
    if (!title.trim() || !amount || Number(amount) <= 0 || !date || !category) {
      return;
    }

    const payload = {
      type,
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      recurrence,
    };

    if (editingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...payload } : t))
      );
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
    setActiveTab("transactions");
  }

  function removeTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) resetForm();
  }

  function onTypeChange(nextType) {
    setType(nextType);
    setCategory(
      nextType === "income" ? incomeCategories[0] : expenseCategories[0]
    );
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
    setLoggedInUser("");
    setUserEmail("");
    setUserPassword("");
  }

  function updateBudget(categoryName, value) {
    setBudgets((prev) => ({
      ...prev,
      [categoryName]: Number(value) || 0,
    }));
  }

  function resetBudgets() {
    setBudgets(defaultBudgets);
  }

  function resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    setTransactions(initialTransactions);
    setBudgets(defaultBudgets);
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
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financial-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  function printMonthlyReport() {
    window.print();
  }

  function createCurrentMonthFromFixedTransactions() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const fixedTransactions = transactions.filter((t) => t.recurrence === "fixed");

    const existingKeys = new Set(
      transactions
        .filter((t) => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .map(
          (t) => `${t.title}-${t.category}-${t.type}-${t.amount}-${t.recurrence}`
        )
    );

    const newMonthlyTransactions = fixedTransactions
      .filter((t) => {
        const d = new Date(t.date);
        const isAlreadyCurrentMonth =
          d.getMonth() === currentMonth && d.getFullYear() === currentYear;

        const key = `${t.title}-${t.category}-${t.type}-${t.amount}-${t.recurrence}`;
        return !isAlreadyCurrentMonth && !existingKeys.has(key);
      })
      .map((t, index) => ({
        ...t,
        id: Date.now() + index,
        date: new Date(
          currentYear,
          currentMonth,
          Math.min(new Date(t.date).getDate(), 28)
        )
          .toISOString()
          .slice(0, 10),
      }));

    if (newMonthlyTransactions.length) {
      setTransactions((prev) => [...newMonthlyTransactions, ...prev]);
      setFilterMonth(
        `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
      );
    }
  }

  const tabs = [
    { key: "dashboard", label: "דשבורד" },
    { key: "transactions", label: "עסקאות" },
    { key: "reports", label: "דוחות" },
  ];

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f1f5f9 0%, #f8fafc 45%, #eff6ff 100%)",
        color: "#0f172a",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: 16 }}>
        <div
          style={{
            background: "#0f172a",
            color: "#fff",
            borderRadius: 28,
            padding: 24,
            boxShadow: "0 20px 50px rgba(15,23,42,0.25)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: 24,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.14)",
                  borderRadius: 999,
                  padding: "8px 12px",
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
                פלטפורמה פיננסית חכמה
              </div>
              <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.2 }}>
                ניהול כספים בעברית, בצורה ברורה ומקצועית
              </h1>
              <p
                style={{
                  marginTop: 16,
                  maxWidth: 720,
                  color: "#cbd5e1",
                  lineHeight: 1.8,
                }}
              >
                מעקב אחר הכנסות והוצאות, ניתוח קטגוריות, תזרים מזומנים חודשי
                ודשבורד אחד שמרכז את כל מה שחשוב.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: 24,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 18,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>יתרה נוכחית</span>
                <strong style={{ fontSize: 24 }}>
                  {formatCurrency(summary.balance)}
                </strong>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#cbd5e1" }}>הכנסות</div>
                  <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>
                    {formatCurrency(summary.income)}
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#cbd5e1" }}>הוצאות</div>
                  <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>
                    {formatCurrency(summary.expense)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle(), marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: "#64748b" }}>אזור משתמש</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                התחברות / הרשמה
              </div>
              <div style={{ color: "#64748b", marginTop: 6, fontSize: 14 }}>
                שלב ראשון לגרסה מסחרית עם משתמשים אישיים וסנכרון עתידי בענן
              </div>
            </div>

            <div
              style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}
            >
              {loggedInUser ? (
                <>
                  <div
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      border: "1px solid #86efac",
                      borderRadius: 16,
                      padding: "12px 16px",
                    }}
                  >
                    מחובר כעת: <strong>{loggedInUser}</strong>
                  </div>
                  <button style={buttonStyle("outline")} onClick={handleLogout}>
                    התנתקות
                  </button>
                </>
              ) : (
                <>
                  <input
                    style={{ ...inputStyle(), width: 220 }}
                    placeholder="אימייל"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                  <input
                    style={{ ...inputStyle(), width: 220 }}
                    type="password"
                    placeholder="סיסמה"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                  />
                  <button style={buttonStyle()} onClick={handleLogin}>
                    התחברות
                  </button>
                  <button style={buttonStyle("outline")} onClick={handleRegister}>
                    הרשמה
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 6,
            boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
            marginBottom: 24,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 6,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                borderRadius: 14,
                border: "none",
                padding: "12px 16px",
                cursor: "pointer",
                fontWeight: 700,
                background: activeTab === tab.key ? "#0f172a" : "transparent",
                color: activeTab === tab.key ? "#fff" : "#334155",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div style={{ display: "grid", gap: 24 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
              }}
            >
              <SummaryCard
                title="סך הכנסות"
                value={formatCurrency(summary.income)}
                subtitle="לפי הסינון הנוכחי"
                icon={<ArrowUpCircle size={24} />}
                color="#16a34a"
              />
              <SummaryCard
                title="סך הוצאות"
                value={formatCurrency(summary.expense)}
                subtitle="לפי הסינון הנוכחי"
                icon={<ArrowDownCircle size={24} />}
                color="#dc2626"
              />
              <SummaryCard
                title="יתרה"
                value={formatCurrency(summary.balance)}
                subtitle="הכנסות פחות הוצאות"
                icon={<Wallet size={24} />}
              />
              <SummaryCard
                title="מספר עסקאות"
                value={String(summary.count)}
                subtitle="רשומות פעילות במערכת"
                icon={<ReceiptText size={24} />}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr",
                gap: 24,
              }}
            >
              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                  עסקאות אחרונות
                </div>

                {latestTransactions.length === 0 ? (
                  <EmptyState
                    title="אין עדיין עסקאות להצגה"
                    text="הוסף עסקה חדשה כדי להתחיל לנהל את הכספים שלך."
                  />
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {latestTransactions.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 16,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 18,
                          padding: 16,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700 }}>{t.title}</div>
                          <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
                            {t.category} · {formatDate(t.date)} ·{" "}
                            {t.recurrence === "fixed" ? "קבועה" : "משתנה"}
                          </div>
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: t.type === "income" ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {formatCurrency(t.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
                  חלוקת הוצאות לפי קטגוריה
                </div>

                <div style={{ width: "100%", height: 360 }}>
                  {expenseByCategory.length === 0 ? (
                    <EmptyState
                      title="אין נתוני הוצאות"
                      text="כשתוסיף הוצאות, כאן תופיע התפלגות לפי קטגוריה."
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseByCategory}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={3}
                        >
                          {expenseByCategory.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={chartColors[index % chartColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "0.9fr 1.1fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div style={cardStyle()}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 22,
                  fontWeight: 700,
                  marginBottom: 20,
                }}
              >
                <Pencil size={20} />
                {editingId ? "עריכת עסקה" : "הוספת עסקה חדשה"}
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8 }}>
                    סוג עסקה
                  </label>
                  <select
                    style={inputStyle()}
                    value={type}
                    onChange={(e) => onTypeChange(e.target.value)}
                  >
                    <option value="income">הכנסה</option>
                    <option value="expense">הוצאה</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8 }}>תיאור</label>
                  <input
                    style={inputStyle()}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="למשל: משכורת / קניות / תשלום מספק"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8 }}>קטגוריה</label>
                  <select
                    style={inputStyle()}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8 }}>סכום</label>
                  <input
                    style={inputStyle()}
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="הזן סכום"
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8 }}>תאריך</label>
                  <input
                    style={inputStyle()}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8 }}>
                    אופי העסקה
                  </label>
                  <select
                    style={inputStyle()}
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                  >
                    {recurrenceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ ...buttonStyle(), width: "100%" }} onClick={saveTransaction}>
                    {editingId ? "עדכן עסקה" : "שמור עסקה"}
                  </button>
                  {editingId && (
                    <button style={buttonStyle("outline")} onClick={resetForm}>
                      ביטול
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={cardStyle()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700 }}>רשימת עסקאות</div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <select
                    style={{ ...inputStyle(), width: 170 }}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">כל הסוגים</option>
                    <option value="income">הכנסות בלבד</option>
                    <option value="expense">הוצאות בלבד</option>
                  </select>

                  <select
                    style={{ ...inputStyle(), width: 170 }}
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                  >
                    <option value="all">כל החודשים</option>
                    {monthOptions.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  <select
                    style={{ ...inputStyle(), width: 170 }}
                    value={filterRecurrence}
                    onChange={(e) => setFilterRecurrence(e.target.value)}
                  >
                    <option value="all">קבועה + משתנה</option>
                    <option value="fixed">קבועה בלבד</option>
                    <option value="variable">משתנה בלבד</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                <button
                  style={buttonStyle("outline")}
                  onClick={createCurrentMonthFromFixedTransactions}
                >
                  <Sparkles size={16} style={{ marginLeft: 6 }} />
                  צור לחודש הנוכחי עסקאות קבועות
                </button>

                <button style={buttonStyle("outline")} onClick={exportToCSV}>
                  <Download size={16} style={{ marginLeft: 6 }} />
                  ייצוא ל-CSV
                </button>

                <button style={buttonStyle("outline")} onClick={printMonthlyReport}>
                  <FileText size={16} style={{ marginLeft: 6 }} />
                  דוח חודשי להדפסה
                </button>

                <button style={buttonStyle("outline")} onClick={resetAllData}>
                  אפס נתונים
                </button>
              </div>

              {filteredTransactions.length === 0 ? (
                <EmptyState
                  title="לא נמצאו עסקאות"
                  text="נסה לשנות את הסינון או להוסיף עסקה חדשה."
                />
              ) : (
                <div style={{ display: "grid", gap: 12, maxHeight: 560, overflow: "auto" }}>
                  {[...filteredTransactions]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 14,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 18,
                          padding: 16,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <strong>{t.title}</strong>
                            <span
                              style={{
                                fontSize: 12,
                                borderRadius: 999,
                                padding: "4px 10px",
                                background:
                                  t.type === "income" ? "#dcfce7" : "#fee2e2",
                                color:
                                  t.type === "income" ? "#166534" : "#991b1b",
                              }}
                            >
                              {t.type === "income" ? "הכנסה" : "הוצאה"}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              color: "#64748b",
                              fontSize: 14,
                            }}
                          >
                            <span>
                              {t.category} · {formatDate(t.date)}
                            </span>
                            <span
                              style={{
                                borderRadius: 999,
                                padding: "4px 10px",
                                border: "1px solid #cbd5e1",
                                background:
                                  t.recurrence === "fixed"
                                    ? "#dbeafe"
                                    : "#fef3c7",
                                color:
                                  t.recurrence === "fixed"
                                    ? "#1d4ed8"
                                    : "#92400e",
                              }}
                            >
                              {t.recurrence === "fixed" ? "קבועה" : "משתנה"}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              minWidth: 120,
                              textAlign: "left",
                              fontWeight: 700,
                              color:
                                t.type === "income" ? "#16a34a" : "#dc2626",
                            }}
                          >
                            {t.type === "income" ? "+" : "-"}
                            {formatCurrency(t.amount)}
                          </div>

                          <button
                            style={buttonStyle("outline")}
                            onClick={() => startEditTransaction(t)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            style={buttonStyle("outline")}
                            onClick={() => removeTransaction(t.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div style={{ display: "grid", gap: 24 }}>
            <div style={cardStyle()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  ניהול תקציב חודשי לפי קטגוריה
                </div>
                <button style={buttonStyle("outline")} onClick={resetBudgets}>
                  אפס תקציבים לברירת מחדל
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                }}
              >
                {expenseCategories.map((categoryName) => {
                  const status = budgetStatus.find(
                    (item) => item.category === categoryName
                  );

                  return (
                    <div
                      key={categoryName}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 18,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          marginBottom: 12,
                          alignItems: "center",
                        }}
                      >
                        <strong>{categoryName}</strong>
                        <span
                          style={{
                            fontSize: 12,
                            borderRadius: 999,
                            padding: "4px 10px",
                            background: status?.overBudget ? "#fee2e2" : "#dcfce7",
                            color: status?.overBudget ? "#991b1b" : "#166534",
                          }}
                        >
                          {status?.overBudget ? "חריגה" : "תקין"}
                        </span>
                      </div>

                      <label style={{ display: "block", marginBottom: 8 }}>
                        תקציב חודשי
                      </label>
                      <input
                        style={inputStyle()}
                        type="number"
                        value={budgets[categoryName] ?? 0}
                        onChange={(e) => updateBudget(categoryName, e.target.value)}
                      />

                      <div style={{ marginTop: 14, fontSize: 14, color: "#475569" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <span>הוצאה בפועל</span>
                          <strong>{formatCurrency(status?.spent || 0)}</strong>
                        </div>

                        <div
                          style={{
                            height: 10,
                            background: "#e2e8f0",
                            borderRadius: 999,
                            overflow: "hidden",
                            marginBottom: 10,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(status?.percent || 0, 100)}%`,
                              background: status?.overBudget ? "#ef4444" : "#10b981",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <span>ניצול תקציב</span>
                          <span>{status?.budget ? `${status.percent}%` : "לא הוגדר"}</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>יתרה</span>
                          <strong
                            style={{
                              color:
                                (status?.remaining || 0) < 0 ? "#dc2626" : "#16a34a",
                            }}
                          >
                            {formatCurrency(status?.remaining || 0)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              <div style={cardStyle()}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 20,
                  }}
                >
                  <TrendingUp size={20} />
                  מגמת הכנסות מול הוצאות
                </div>

                <div style={{ width: "100%", height: 420 }}>
                  {monthlyData.length === 0 ? (
                    <EmptyState
                      title="אין מספיק נתונים לדוח"
                      text="הוסף עסקאות במספר חודשים כדי לראות מגמה."
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="הכנסות" fill="#16a34a" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="הוצאות" fill="#dc2626" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div style={cardStyle()}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 20,
                  }}
                >
                  <PieChartIcon size={20} />
                  תובנות מרכזיות
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 18,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ color: "#64748b", fontSize: 14 }}>היתרה הנוכחית</div>
                  <div style={{ marginTop: 8, fontSize: 32, fontWeight: 700 }}>
                    {formatCurrency(summary.balance)}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div
                    style={{
                      background: "#dcfce7",
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <div style={{ color: "#166534", fontSize: 14 }}>
                      הכנסה ממוצעת לעסקה
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 26,
                        fontWeight: 700,
                        color: "#166534",
                      }}
                    >
                      {formatCurrency(
                        (() => {
                          const rows = filteredTransactions.filter(
                            (t) => t.type === "income"
                          );
                          return rows.length
                            ? rows.reduce((sum, t) => sum + t.amount, 0) / rows.length
                            : 0;
                        })()
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#fee2e2",
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <div style={{ color: "#991b1b", fontSize: 14 }}>
                      הוצאה ממוצעת לעסקה
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 26,
                        fontWeight: 700,
                        color: "#991b1b",
                      }}
                    >
                      {formatCurrency(
                        (() => {
                          const rows = filteredTransactions.filter(
                            (t) => t.type === "expense"
                          );
                          return rows.length
                            ? rows.reduce((sum, t) => sum + t.amount, 0) / rows.length
                            : 0;
                        })()
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ ...cardStyle(), marginTop: 16, padding: 16 }}>
                  <div style={{ color: "#64748b", fontSize: 14 }}>
                    הקטגוריה המובילה בהוצאות
                  </div>
                  <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>
                    {expenseByCategory.length
                      ? [...expenseByCategory].sort((a, b) => b.value - a.value)[0]
                          .name
                      : "אין עדיין נתונים"}
                  </div>
                </div>

                <div style={{ ...cardStyle(), marginTop: 16, padding: 16 }}>
                  <div style={{ color: "#64748b", fontSize: 14 }}>
                    חריגות תקציב פעילות
                  </div>
                  <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>
                    {budgetStatus.filter((item) => item.overBudget).length}
                  </div>
                  <div style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
                    {budgetStatus.filter((item) => item.overBudget).length
                      ? `יש כרגע חריגה ב-${
                          budgetStatus.filter((item) => item.overBudget).length
                        } קטגוריות.`
                      : "אין כרגע חריגות תקציב לפי הסינון הנוכחי."}
                  </div>
                </div>

                <div style={{ ...cardStyle(), marginTop: 16, padding: 16 }}>
                  <div style={{ color: "#64748b", fontSize: 14 }}>סטטוס מהיר</div>
                  <div
                    style={{
                      marginTop: 8,
                      lineHeight: 1.8,
                      color: "#334155",
                    }}
                  >
                    {summary.balance >= 0
                      ? "המצב הכספי הנוכחי חיובי. ניתן להמשיך לעקוב אחר דפוסי ההוצאות ולזהות הזדמנויות לחיסכון נוסף."
                      : "כרגע ההוצאות גבוהות מההכנסות במסגרת הסינון הנוכחי. מומלץ לבדוק אילו קטגוריות מכבידות ביותר."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
