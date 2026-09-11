import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { formatPKR } from '../lib/utils';

export default function Analytics({ transactions }) {
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'MMM yyyy'));

  const { chartData, ledgerData, availableMonths } = useMemo(() => {
    const monthsSet = new Set();
    const monthlyMap = {};
    const weeklyMap = {};
    const ledgerMap = {};

    transactions.forEach(t => {
      if (!t.timestamp) return;
      const date = t.timestamp.toDate();
      const monthStr = format(date, 'MMM yyyy');
      monthsSet.add(monthStr);

      let isIncome = false;
      let isExpense = false;
      let ledgerName = 'Direct';

      if (t.type === 'Credit') { 
        isIncome = true; 
        ledgerName = t.description || 'Direct Credit'; 
      }
      else if (t.type === 'Debit') { 
        isExpense = true; 
        ledgerName = t.description || 'Direct Debit'; 
      }
      else if (t.type === 'Settle') {
        if (t.description.includes('Receivable')) isIncome = true;
        if (t.description.includes('Payable')) isExpense = true;
        const parts = t.description.split(' for ');
        if (parts.length > 1) ledgerName = parts[1];
      } else {
        return; 
      }

      const amount = Number(t.amount) || 0;

      // Monthly Chart Data
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { name: monthStr, Income: 0, Expense: 0, timestamp: date.getTime() };
      }
      if (isIncome) monthlyMap[monthStr].Income += amount;
      if (isExpense) monthlyMap[monthStr].Expense += amount;

      // Weekly Chart Data
      const weekStart = format(startOfWeek(date), 'MMM dd');
      const weekEnd = format(endOfWeek(date), 'MMM dd');
      const weekStr = `${weekStart} - ${weekEnd}`;
      
      if (!weeklyMap[weekStr]) {
        weeklyMap[weekStr] = { name: weekStr, Income: 0, Expense: 0, month: monthStr, timestamp: date.getTime() };
      }
      if (isIncome) weeklyMap[weekStr].Income += amount;
      if (isExpense) weeklyMap[weekStr].Expense += amount;

      // Ledger Aggregation
      if (viewMode === 'monthly' || monthStr === selectedMonth) {
        if (!ledgerMap[ledgerName]) ledgerMap[ledgerName] = { name: ledgerName, Income: 0, Expense: 0 };
        if (isIncome) ledgerMap[ledgerName].Income += amount;
        if (isExpense) ledgerMap[ledgerName].Expense += amount;
      }
    });

    const sortedMonths = Object.values(monthlyMap).sort((a, b) => a.timestamp - b.timestamp);
    
    let activeChartData = [];
    if (viewMode === 'monthly') {
      activeChartData = sortedMonths;
    } else {
      activeChartData = Object.values(weeklyMap)
        .filter(w => w.month === selectedMonth)
        .sort((a, b) => a.timestamp - b.timestamp);
    }

    const sortedLedgers = Object.values(ledgerMap).sort((a, b) => (b.Income + b.Expense) - (a.Income + a.Expense));

    return {
      chartData: activeChartData,
      ledgerData: sortedLedgers,
      availableMonths: Array.from(monthsSet)
    };
  }, [transactions, viewMode, selectedMonth]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-light text-white">Financial Analytics</h2>
        <div className="flex gap-2">
          {viewMode === 'weekly' && availableMonths.length > 0 && (
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-sky-500"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
          <div className="flex bg-[#1a1a1a] border border-[#333] rounded-lg p-1">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-1 text-sm rounded-md transition-colors ${viewMode === 'monthly' ? 'bg-[#0ea5e9] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-1 text-sm rounded-md transition-colors ${viewMode === 'weekly' ? 'bg-[#0ea5e9] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#333333] p-6 h-[400px]">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No data available for this view.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs ${val / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ fontSize: '13px' }}
                formatter={(value) => formatPKR(value)}
              />
              <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
              <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Ledger Breakdown Section */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#333333] p-6">
        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-6">
          Ledger Impact {viewMode === 'weekly' ? `(${selectedMonth})` : '(All Time)'}
        </h3>
        <div className="divide-y divide-[#2a2a2a]">
          {ledgerData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No ledgers settled or transactions made.</p>
          ) : (
            ledgerData.map(l => (
              <div key={l.name} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <span className="text-white font-medium">{l.name}</span>
                <div className="flex gap-8 text-right">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Deducted</span>
                    <span className="text-red-500 font-mono text-sm">{formatPKR(l.Expense)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Credited</span>
                    <span className="text-green-500 font-mono text-sm">{formatPKR(l.Income)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
