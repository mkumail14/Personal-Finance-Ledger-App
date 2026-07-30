import React from 'react';
import { formatPKR } from '../lib/utils';
import { Wallet, Landmark, CreditCard, Box, TrendingUp, ScrollText } from 'lucide-react';

export default function AccountsDashboard({ accounts, receivablesTotal }) {
  const totalAssets = accounts.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);
  const totalAvailable = accounts
    .filter(acc => {
      const name = acc.name.toLowerCase();
      return !name.includes('baba') && !name.includes('bond');
    })
    .reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

  const getAccountIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('bank')) return <Landmark size={18} className="text-[#0ea5e9]" />;
    if (lower.includes('card')) return <CreditCard size={18} className="text-[#0ea5e9]" />;
    if (lower.includes('cupboard') || lower.includes('safe')) return <Box size={18} className="text-[#0ea5e9]" />;
    if (lower.includes('bond')) return <ScrollText size={18} className="text-[#0ea5e9]" />;
    return <Wallet size={18} className="text-[#0ea5e9]" />;
  };

  return (
    <div className="flex flex-col gap-8 mb-10">
      <div className="flex gap-12">
        <div className="flex flex-col">
          <h2 className="text-gray-400 text-[13px] font-sans mb-1">Total Available</h2>
          <div className="text-4xl font-light tracking-tight text-white">
            {formatPKR(totalAvailable)}
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-gray-400 text-[13px] font-sans mb-1">Total Assets</h2>
          <div className="text-4xl font-light tracking-tight text-white">
            {formatPKR(totalAssets)}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {accounts.map(account => (
          <div key={account.id} className="flex items-center gap-4 p-3 pr-6 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#333333] transition-colors min-w-[160px]">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222222] flex items-center justify-center">
              {getAccountIcon(account.name)}
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[11px] font-sans">{account.name}</span>
              <span className="text-white font-mono text-[13px]">{formatPKR(account.balance)}</span>
            </div>
          </div>
        ))}

        {receivablesTotal !== undefined && (
          <div className="flex items-center gap-4 p-3 pr-6 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#333333] transition-colors min-w-[160px]">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222222] flex items-center justify-center">
              <TrendingUp size={18} className="text-green-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[11px] font-sans">Receivables</span>
              <span className="text-green-500 font-mono text-[13px]">{formatPKR(receivablesTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
