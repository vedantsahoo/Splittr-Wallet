import db from '../db.js';
function convertAmount(amount, from, to) {
    if (from === to)
        return amount;
    // Convert from source to INR
    let amountInINR = amount;
    if (from === 'USD') {
        amountInINR = amount * 83;
    }
    else if (from === 'EUR') {
        amountInINR = amount * 90;
    }
    // Convert from INR to target
    if (to === 'INR') {
        return amountInINR;
    }
    else if (to === 'USD') {
        return amountInINR / 83;
    }
    else if (to === 'EUR') {
        return amountInINR / 90;
    }
    return amountInINR;
}
function getDateRanges(period) {
    const now = new Date();
    let currentStart = '';
    let currentEnd = now.toISOString().split('T')[0];
    let prevStart = '';
    let prevEnd = '';
    if (period === 'This Week') {
        const start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        currentStart = start.toISOString().split('T')[0];
        const prevEndObj = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        prevEnd = prevEndObj.toISOString().split('T')[0];
        const prevStartObj = new Date(prevEndObj.getTime() - 6 * 24 * 60 * 60 * 1000);
        prevStart = prevStartObj.toISOString().split('T')[0];
    }
    else if (period === 'This Year') {
        currentStart = `${now.getFullYear()}-01-01`;
        prevStart = `${now.getFullYear() - 1}-01-01`;
        prevEnd = `${now.getFullYear() - 1}-12-31`;
    }
    else {
        // 'This Month' default
        const month = String(now.getMonth() + 1).padStart(2, '0');
        currentStart = `${now.getFullYear()}-${month}-01`;
        const prevMonthVal = now.getMonth() === 0 ? 12 : now.getMonth();
        const prevYearVal = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const prevMonthStr = String(prevMonthVal).padStart(2, '0');
        prevStart = `${prevYearVal}-${prevMonthStr}-01`;
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        prevEnd = `${prevYearVal}-${prevMonthStr}-${String(lastDayOfPrevMonth).padStart(2, '0')}`;
    }
    return { currentStart, currentEnd, prevStart, prevEnd };
}
function getCategoryInfo(category) {
    const cat = category.toLowerCase().trim();
    if (cat.includes('food') || cat.includes('dining')) {
        return { name: 'Food & Dining', color: '#10B981' };
    }
    if (cat.includes('travel') || cat.includes('transport') || cat.includes('goa')) {
        return { name: 'Transportation', color: '#0D9488' };
    }
    if (cat.includes('shop')) {
        return { name: 'Shopping', color: '#3B82F6' };
    }
    if (cat.includes('entertain') || cat.includes('movie') || cat.includes('show')) {
        return { name: 'Entertainment', color: '#F59E0B' };
    }
    if (cat.includes('bill') || cat.includes('utilities') || cat.includes('rent')) {
        return { name: 'Bills', color: '#EF4444' };
    }
    if (cat.includes('saving') || cat.includes('goal')) {
        return { name: 'Savings', color: '#8B5CF6' };
    }
    if (cat.includes('transfer') || cat.includes('send') || cat.includes('receive')) {
        return { name: 'Transfers', color: '#6366F1' };
    }
    if (cat.includes('settle')) {
        return { name: 'Settlements', color: '#14B8A6' };
    }
    return { name: 'Others', color: '#EC4899' };
}
// GET /api/analytics
export const getAnalytics = (req, res) => {
    try {
        const userId = req.userId;
        const period = req.query.period || 'This Month';
        const targetCurrency = req.query.currency || 'INR';
        const { currentStart, currentEnd, prevStart, prevEnd } = getDateRanges(period);
        // 1. Fetch current period transactions
        const currentTx = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
        AND date >= ? AND date <= ?
    `).all(userId, currentStart, currentEnd);
        // 2. Fetch previous period transactions for comparison
        const prevTx = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
        AND date >= ? AND date <= ?
    `).all(userId, prevStart, prevEnd);
        const calculateTotals = (txList) => {
            let spent = 0;
            let received = 0;
            let groupExp = 0;
            txList.forEach(t => {
                const converted = convertAmount(t.amount, t.currency, targetCurrency);
                if (t.type === 'sent' || t.type === 'withdrawal' || t.type === 'group_expense' || t.type === 'group_settlement') {
                    spent += converted;
                    if (t.type === 'group_expense') {
                        groupExp += converted;
                    }
                }
                else if (t.type === 'received' || t.type === 'wallet_funding') {
                    received += converted;
                }
            });
            return { spent, received, groupExp };
        };
        const currentTotals = calculateTotals(currentTx);
        const prevTotals = calculateTotals(prevTx);
        const getPercentChange = (current, previous) => {
            if (previous === 0) {
                return current > 0 ? 100 : 0;
            }
            return Math.round(((current - previous) / previous) * 100);
        };
        const spentChange = getPercentChange(currentTotals.spent, prevTotals.spent);
        const receivedChange = getPercentChange(currentTotals.received, prevTotals.received);
        // 3. Category Breakdown (Current Period Spending)
        const categoryMap = {};
        currentTx.forEach(t => {
            if (t.type === 'sent' || t.type === 'withdrawal' || t.type === 'group_expense' || t.type === 'group_settlement') {
                const converted = convertAmount(t.amount, t.currency, targetCurrency);
                const info = getCategoryInfo(t.category);
                if (!categoryMap[info.name]) {
                    categoryMap[info.name] = { value: 0, color: info.color };
                }
                categoryMap[info.name].value += converted;
            }
        });
        const categoryBreakdown = Object.entries(categoryMap).map(([name, data]) => ({
            name,
            value: Math.round(data.value * 100) / 100,
            color: data.color
        })).sort((a, b) => b.value - a.value);
        // 4. Monthly Trend (Last 6 Months chronologically)
        const trendData = [];
        const now = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const startOfTrend = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const trendStartDate = startOfTrend.toISOString().split('T')[0];
        const trendTx = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
        AND date >= ? AND date <= ?
        AND type IN ('sent', 'withdrawal', 'group_expense', 'group_settlement')
    `).all(userId, trendStartDate, currentEnd);
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = monthNames[d.getMonth()];
            trendData.push({ month: label, amount: 0 });
        }
        trendTx.forEach(t => {
            const txDate = new Date(t.date);
            const label = monthNames[txDate.getMonth()];
            const index = trendData.findIndex(item => item.month === label);
            if (index !== -1) {
                trendData[index].amount += convertAmount(t.amount, t.currency, targetCurrency);
            }
        });
        trendData.forEach(item => {
            item.amount = Math.round(item.amount * 100) / 100;
        });
        res.json({
            summary: {
                totalSpent: Math.round(currentTotals.spent * 100) / 100,
                totalReceived: Math.round(currentTotals.received * 100) / 100,
                groupExpenses: Math.round(currentTotals.groupExp * 100) / 100,
                spentChange,
                receivedChange
            },
            categoryBreakdown,
            monthlyTrend: trendData
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
