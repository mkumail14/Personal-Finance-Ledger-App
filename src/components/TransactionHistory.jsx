import React from 'react';
import { formatPKR } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, FilePlus2 } from 'lucide-react';

export default function TransactionHistory({ transactions, accounts }) {
  const getIcon = (type) => {
    switch (type) {
      case 'Credit':
        return <ArrowDownRight size={16} className="text-green-500" />;
      case 'Debit':
        return <ArrowUpRight size={16} className="text-red-500" />;
      case 'Settle':
        return <CheckCircle2 size={16} className="text-blue-500" />;
      case 'Add Ledger':
        return <FilePlus2 size={16} className="text-orange-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-500" />;
    }
  };

  const getAccountName = (accountId) => {
    if (!accountId) return '';
    const acc = accounts.find(a => a.id === accountId);
    return acc ? acc.name : 'Unknown Account';
  };

  return (
    <div className="mt-12 mb-12">
      <h2 className="text-xl font-light text-white mb-6 flex items-center gap-2">
        Transaction History
      </h2>
      <div className="bg-[#1a1a1a] rounded-xl border border-[#333333] overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2a] max-h-[500px] overflow-y-auto">
            {transactions.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-[#1e1e1e] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#222222] flex items-center justify-center shrink-0">
                    {getIcon(t.type)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-200">{t.description}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="font-mono bg-[#222222] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{t.type}</span>
                      {t.accountId && (
                        <span>• {getAccountName(t.accountId)}</span>
                      )}
                      {t.timestamp && (
                        <span>• {new Date(t.timestamp.toDate()).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`font-mono text-sm ${t.type === 'Debit' ? 'text-red-500' : 'text-green-500'}`}>
                  {t.type === 'Debit' ? '-' : '+'}{formatPKR(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
