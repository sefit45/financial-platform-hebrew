import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  FileText,
  Pencil,
  PieChart as PieChartIcon,
  Plus,
  ReceiptText,
  Repeat,
  Shuffle,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const incomeCategories = ['משכורת', 'עסק', 'השקעות', 'החזר', 'אחר'];
const expenseCategories = ['מזון', 'דיור', 'תחבורה', 'בילויים', 'חשבונות', 'בריאות', 'חינוך', 'קניות', 'אחר'];
const recurrenceOptions = [
  { value: 'fixed', label: 'קבועה' },
  { value: 'variable', label: 'משתנה' },
];
const chartColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#ca8a04', '#4f46e5', '#64748b'];
const STORAGE_KEY = 'financial-platform-hebrew-rtl-data-v1';

const initialTransactions = [
  { id: 1, type: 'income', title: 'משכורת חודשית', category: 'משכורת', amount: 12500, date: '2026-04-02', recurrence: 'fixed' },
  { id: 2, type: 'expense', title: 'סופרמרקט', category: 'מזון', amount: 860, date: '2026-04-04', recurrence: 'variable' },
  { id: 3, type: 'expense', title: 'שכר דירה', category: 'דיור', amount: 4200, date: '2026-04-05', recurrence: 'fixed' },
  { id: 4, type: 'income', title: 'הכנסה מפרויקט', category: 'עסק', amount: 3400, date: '2026-04-08', recurrence: 'variable' },
  { id: 5, type: 'expense', title: 'דלק ורכב', category: 'תחבורה', amount: 540, date: '2026-04-11', recurrence: 'variable' },
  { id: 6, type: 'expense', title: 'מסעדה', category: 'בילויים', amount: 290, date: '2026-04-13', recurrence: 'variable' },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value || 0);
}
function formatDate(dateString) {
  return new Intl.DateTimeFormat('he-IL').format(new Date(dateString));
}
function monthKey(dateString) {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(dateString) {
  return new Intl.DateTimeFormat('he-IL', { month: 'short', year: 'numeric' }).format(new Date(dateString));
}

function SummaryCard({ title, value, icon, subtitle, status }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="card summary-card">
        <div>
          <div className="summary-title">{title}</div>
          <div className={`summary-value ${status || ''}`}>{value}</div>
          <div className="summary-subtitle">{subtitle}</div>
        </div>
        <div className="summary-icon">{icon}</div>
      </div>
    </motion.div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-title">{title}</div>
      <div className="empty-text">{text}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button className={`tab-button ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialTransactions;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed.transactions) && parsed.transactions.length ? parsed.transactions : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(expenseCategories[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [recurrence, setRecurrence] = useState('variable');
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterRecurrence, setFilterRecurrence] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  const availableCategories = type === 'income' ? incomeCategories : expenseCategories;

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ transactions, type, category, date, recurrence, filterType, filterMonth, filterRecurrence })
    );
  }, [transactions, type, category, date, recurrence, filterType, filterMonth, filterRecurrence]);

  const monthOptions = useMemo(() => {
    const keys = Array.from(new Set(transactions.map((t) => monthKey(t.date)))).sort().reverse();
    return keys.map((key) => {
      const sample = transactions.find((t) => monthKey(t.date) === key);
      return { key, label: sample ? monthLabel(sample.date) : key };
    });
  }, [transactions]);

  const filteredTransactions = useMemo(
    () => transactions.filter((t) => (filterType === 'all' || t.type === filterType) && (filterMonth === 'all' || monthKey(t.date) === filterMonth) && (filterRecurrence === 'all' || t.recurrence === filterRecurrence)),
    [transactions, filterType, filterMonth, filterRecurrence]
  );

  const summary = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const expenseByCategory = useMemo(() => {
    const map = new Map();
    filteredTransactions.filter((t) => t.type === 'expense').forEach((t) => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const grouped = new Map();
    [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((t) => {
      const key = monthKey(t.date);
      if (!grouped.has(key)) grouped.set(key, { month: monthLabel(t.date), הכנסות: 0, הוצאות: 0 });
      const row = grouped.get(key);
      if (t.type === 'income') row['הכנסות'] += t.amount;
      else row['הוצאות'] += t.amount;
    });
    return Array.from(grouped.values());
  }, [transactions]);

  const latestTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  function resetForm() {
    setEditingId(null);
    setType('expense');
    setTitle('');
    setCategory(expenseCategories[0]);
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setRecurrence('variable');
  }

  function addOrUpdateTransaction() {
    if (!title.trim() || !amount || Number(amount) <= 0 || !date || !category) return;

    if (editingId) {
      setTransactions((prev) => prev.map((t) => t.id === editingId ? { ...t, type, title: title.trim(), category, amount: Number(amount), date, recurrence } : t));
    } else {
      setTransactions((prev) => [{ id: Date.now(), type, title: title.trim(), category, amount: Number(amount), date, recurrence }, ...prev]);
    }
    resetForm();
  }

  function startEditTransaction(transaction) {
    setActiveTab('transactions');
    setEditingId(transaction.id);
    setType(transaction.type);
    setTitle(transaction.title);
    setCategory(transaction.category);
    setAmount(String(transaction.amount));
    setDate(transaction.date);
    setRecurrence(transaction.recurrence || 'variable');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) resetForm();
    setDeleteId(null);
  }

  function exportToCSV() {
    const headers = ['תאריך', 'תיאור', 'סוג', 'קטגוריה', 'אופי', 'סכום'];
    const rows = filteredTransactions.map((t) => [formatDate(t.date), t.title, t.type === 'income' ? 'הכנסה' : 'הוצאה', t.category, t.recurrence === 'fixed' ? 'קבועה' : 'משתנה', t.amount]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
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

  function resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    setTransactions(initialTransactions);
    setFilterType('all');
    setFilterMonth('all');
    setFilterRecurrence('all');
    resetForm();
  }

  function createCurrentMonthFromFixedTransactions() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const fixedTransactions = transactions.filter((t) => t.recurrence === 'fixed');
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
        return !(d.getMonth() === currentMonth && d.getFullYear() === currentYear) && !alreadyExistingKeys.has(key);
      })
      .map((t, index) => ({
        ...t,
        id: Date.now() + index,
        date: new Date(currentYear, currentMonth, Math.min(new Date(t.date).getDate(), 28)).toISOString().slice(0, 10),
      }));

    if (newMonthlyTransactions.length) {
      setTransactions((prev) => [...newMonthlyTransactions, ...prev]);
      setFilterMonth(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);
    }
  }

  const topExpenseCategory = [...expenseByCategory].sort((a, b) => b.value - a.value)[0]?.name || 'אין עדיין נתונים';
  const avgIncome = filteredTransactions.filter((t) => t.type === 'income');
  const avgExpense = filteredTransactions.filter((t) => t.type === 'expense');

  return (
    <div className="app-shell">
      <div className="container">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero">
          <div>
            <div className="hero-badge">פלטפורמה פיננסית חכמה</div>
            <h1>ניהול כספים בעברית, בצורה ברורה ומקצועית</h1>
            <p>מעקב אחר הכנסות והוצאות, ניתוח קטגוריות, תזרים מזומנים חודשי ודשבורד אחד שמרכז את כל מה שחשוב.</p>
          </div>
          <div className="hero-panel">
            <div className="hero-row"><span>יתרה נוכחית</span><strong>{formatCurrency(summary.balance)}</strong></div>
            <div className="hero-grid">
              <div><span>הכנסות</span><strong>{formatCurrency(summary.income)}</strong></div>
              <div><span>הוצאות</span><strong>{formatCurrency(summary.expense)}</strong></div>
            </div>
          </div>
        </motion.section>

        <div className="tabs-bar">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>דשבורד</TabButton>
          <TabButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')}>עסקאות</TabButton>
          <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>דוחות</TabButton>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="summary-grid">
              <SummaryCard title="סך הכנסות" value={formatCurrency(summary.income)} subtitle="לפי הסינון הנוכחי" icon={<ArrowUpCircle size={22} />} status="positive" />
              <SummaryCard title="סך הוצאות" value={formatCurrency(summary.expense)} subtitle="לפי הסינון הנוכחי" icon={<ArrowDownCircle size={22} />} status="negative" />
              <SummaryCard title="יתרה" value={formatCurrency(summary.balance)} subtitle="הכנסות פחות הוצאות" icon={<Wallet size={22} />} />
              <SummaryCard title="מספר עסקאות" value={String(summary.count)} subtitle="רשומות פעילות במערכת" icon={<ReceiptText size={22} />} />
            </div>

            <div className="two-column">
              <div className="card">
                <h2>עסקאות אחרונות</h2>
                {latestTransactions.length === 0 ? <EmptyState title="אין עדיין עסקאות להצגה" text="הוסף עסקה חדשה כדי להתחיל לנהל את הכספים שלך." /> : (
                  <div className="list">
                    {latestTransactions.map((t) => (
                      <div key={t.id} className="transaction-item">
                        <div>
                          <div className="transaction-top"><strong>{t.title}</strong><span className={`pill ${t.type}`}>{t.type === 'income' ? 'הכנסה' : 'הוצאה'}</span></div>
                          <div className="transaction-meta"><span>{t.category} · {formatDate(t.date)}</span><span className="pill neutral">{t.recurrence === 'fixed' ? 'קבועה' : 'משתנה'}</span></div>
                        </div>
                        <div className={`amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card chart-card">
                <h2>חלוקת הוצאות לפי קטגוריה</h2>
                {expenseByCategory.length === 0 ? <EmptyState title="אין נתוני הוצאות" text="כשתוסיף הוצאות, כאן תופיע התפלגות לפי קטגוריה." /> : (
                  <ResponsiveContainer width="100%" height={340}>
                    <PieChart>
                      <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                        {expenseByCategory.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <div className="two-column reverse-ratio">
            <div className="card">
              <h2>{editingId ? 'עריכת עסקה' : 'הוספת עסקה חדשה'}</h2>
              <div className="form-grid">
                <label>סוג עסקה<select value={type} onChange={(e) => { setType(e.target.value); setCategory(e.target.value === 'income' ? incomeCategories[0] : expenseCategories[0]); }}><option value="income">הכנסה</option><option value="expense">הוצאה</option></select></label>
                <label>תיאור<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="למשל: תשלום מספק / משכורת / קניות" /></label>
                <label>קטגוריה<select value={category} onChange={(e) => setCategory(e.target.value)}>{availableCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></label>
                <label>סכום<input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="הזן סכום" /></label>
                <label>תאריך<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
                <label>אופי העסקה<select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>{recurrenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <div className="actions-row">
                  <button className="primary-button" onClick={addOrUpdateTransaction}>{editingId ? 'עדכן עסקה' : 'שמור עסקה'}</button>
                  {editingId && <button className="secondary-button" onClick={resetForm}>בטל עריכה</button>}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="header-with-tools">
                <h2>רשימת עסקאות</h2>
                <div className="filters-grid">
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)}><option value="all">כל הסוגים</option><option value="income">הכנסות בלבד</option><option value="expense">הוצאות בלבד</option></select>
                  <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}><option value="all">כל החודשים</option>{monthOptions.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}</select>
                  <select value={filterRecurrence} onChange={(e) => setFilterRecurrence(e.target.value)}><option value="all">קבועה + משתנה</option><option value="fixed">קבועה בלבד</option><option value="variable">משתנה בלבד</option></select>
                </div>
                <div className="toolbar">
                  <button className="secondary-button" onClick={createCurrentMonthFromFixedTransactions}><Sparkles size={16} /> צור לחודש הנוכחי עסקאות קבועות</button>
                  <button className="secondary-button" onClick={exportToCSV}><Download size={16} /> ייצוא ל-CSV</button>
                  <button className="secondary-button" onClick={printMonthlyReport}><FileText size={16} /> דוח חודשי להדפסה</button>
                  <button className="danger-button" onClick={resetAllData}>אפס נתונים</button>
                </div>
              </div>

              {filteredTransactions.length === 0 ? <EmptyState title="לא נמצאו עסקאות" text="נסה לשנות את הסינון או להוסיף עסקה חדשה." /> : (
                <div className="list scrollable">
                  {[...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((t) => (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="transaction-item">
                      <div>
                        <div className="transaction-top"><strong>{t.title}</strong><span className={`pill ${t.type}`}>{t.type === 'income' ? 'הכנסה' : 'הוצאה'}</span></div>
                        <div className="transaction-meta">
                          <span>{t.category} · {formatDate(t.date)}</span>
                          <span className={`pill ${t.recurrence === 'fixed' ? 'fixed' : 'variable'}`}>
                            {t.recurrence === 'fixed' ? <Repeat size={14} /> : <Shuffle size={14} />}
                            {t.recurrence === 'fixed' ? 'קבועה' : 'משתנה'}
                          </span>
                        </div>
                      </div>
                      <div className="transaction-actions">
                        <div className={`amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</div>
                        <button className="icon-button" onClick={() => startEditTransaction(t)}><Pencil size={16} /></button>
                        <button className="icon-button" onClick={() => setDeleteId(t.id)}><Trash2 size={16} /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="two-column">
            <div className="card chart-card">
              <h2><TrendingUp size={20} /> מגמת הכנסות מול הוצאות</h2>
              {monthlyData.length === 0 ? <EmptyState title="אין מספיק נתונים לדוח" text="הוסף עסקאות במספר חודשים כדי לראות מגמה." /> : (
                <ResponsiveContainer width="100%" height={380}>
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
            </div>

            <div className="card insights-card">
              <h2><PieChartIcon size={20} /> תובנות מרכזיות</h2>
              <div className="insight-box"><span>היתרה הנוכחית</span><strong>{formatCurrency(summary.balance)}</strong></div>
              <div className="split-boxes">
                <div className="mini-box positive"><span>הכנסה ממוצעת לעסקה</span><strong>{formatCurrency(avgIncome.length ? avgIncome.reduce((sum, t) => sum + t.amount, 0) / avgIncome.length : 0)}</strong></div>
                <div className="mini-box negative"><span>הוצאה ממוצעת לעסקה</span><strong>{formatCurrency(avgExpense.length ? avgExpense.reduce((sum, t) => sum + t.amount, 0) / avgExpense.length : 0)}</strong></div>
              </div>
              <div className="mini-box neutral-box"><span>הקטגוריה המובילה בהוצאות</span><strong>{topExpenseCategory}</strong></div>
              <div className="mini-box neutral-box"><span>סטטוס מהיר</span><p>{summary.balance >= 0 ? 'המצב הכספי הנוכחי חיובי. ניתן להמשיך לעקוב אחר דפוסי ההוצאות ולזהות הזדמנויות לחיסכון נוסף.' : 'כרגע ההוצאות גבוהות מההכנסות במסגרת הסינון הנוכחי. מומלץ לבדוק אילו קטגוריות מכבידות ביותר.'}</p></div>
            </div>
          </div>
        )}
      </div>

      {deleteId !== null && (
        <div className="modal-backdrop" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>למחוק את העסקה?</h3>
            <p>הפעולה תסיר את העסקה מהרשימה.</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setDeleteId(null)}>ביטול</button>
              <button className="danger-button" onClick={() => removeTransaction(deleteId)}>מחיקה</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
