import React, { useState } from 'react';
import { formatPKR, cn } from '../lib/utils';
import SmartInput from './SmartInput';
import { CheckCircle2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { evaluate } from 'mathjs';

export default function Ledger({ title, type, items, onAdd, onSettle, accounts }) {
  const [settleItemId, setSettleItemId] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // State for mini input
  const [miniDesc, setMiniDesc] = useState('');
  const [miniExpr, setMiniExpr] = useState('');

  const pendingItems = items.filter(item => item.type === type && item.status === 'Pending');
  
  const subTotal = pendingItems.reduce((acc, curr) => {
    const itemTotal = (curr.entries || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return acc + itemTotal;
  }, 0);

  const handleSettleSubmit = (id) => {
    if (!selectedAccountId) return;
    onSettle(id, selectedAccountId);
    setSettleItemId(null);
    setSelectedAccountId('');
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setMiniDesc('');
      setMiniExpr('');
    }
  };

  const handleMiniSubmit = (e, item) => {
    e.preventDefault();
    if (!miniExpr.trim()) return;
    try {
      const amount = evaluate(miniExpr);
      if (isNaN(amount) || amount === Infinity) throw new Error("Invalid");
      
      onAdd({
        person_name: item.person_name,
        type: item.type,
        status: 'Pending',
        entries: [{
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          desc: miniDesc.trim() || 'Added',
          amount: Number(amount)
        }]
      });
      setMiniDesc('');
      setMiniExpr('');
    } catch (err) {
      alert("Invalid math expression in amount.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end border-b border-[#333333] pb-3 mb-1">
        <h2 className="text-xl font-sans tracking-wide text-white">{title}</h2>
        <span className={cn(
          "text-[15px] font-sans",
          type === 'Receivable' ? "text-green-500" : "text-red-500"
        )}>
          Sub-Total: {formatPKR(subTotal)}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {pendingItems.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No pending items...</p>
        ) : (
          pendingItems.map(item => {
            const itemTotal = (item.entries || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="flex flex-col bg-[#1e1e1e] p-4 rounded-lg border border-[#333333]">
                <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => toggleExpand(item.id)}>
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    <span className="font-mono text-[15px] tracking-wide text-white">{item.person_name}</span>
                  </div>
                  <span className="font-mono text-[15px] tracking-wide text-white">{formatPKR(itemTotal)}</span>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-[#333333]/50 pl-6 flex flex-col gap-2">
                    {(item.entries || []).map(entry => (
                      <div key={entry.id} className="flex justify-between text-sm">
                        <span className="text-gray-400">{entry.desc}</span>
                        <span className="font-mono text-gray-300">{formatPKR(entry.amount)}</span>
                      </div>
                    ))}
                    
                    <form onSubmit={(e) => handleMiniSubmit(e, item)} className="flex gap-2 items-center mt-2">
                      <input 
                        type="text" 
                        placeholder="Desc (e.g. Shampoo)" 
                        value={miniDesc}
                        onChange={e => setMiniDesc(e.target.value)}
                        className="flex-1 min-w-[80px] bg-black border border-[#333333] rounded px-2 py-1 text-[12px] focus:outline-none focus:border-sky-500 text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Amount" 
                        value={miniExpr}
                        onChange={e => setMiniExpr(e.target.value)}
                        className="flex-1 min-w-[60px] bg-black border border-[#333333] rounded px-2 py-1 text-[12px] focus:outline-none focus:border-sky-500 text-white font-mono"
                      />
                      <button type="submit" className="p-1 bg-sky-500/20 text-sky-400 rounded hover:bg-sky-500/30">
                        <Plus size={14} />
                      </button>
                    </form>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  {settleItemId === item.id ? (
                    <div className="flex gap-3 items-center text-sm">
                      <select 
                        value={selectedAccountId} 
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="bg-black border border-sky-500 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 text-white font-sans text-[13px]"
                      >
                        <option value="">Select Account...</option>
                        {accounts?.length === 0 && <option disabled>No accounts found</option>}
                        {accounts?.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleSettleSubmit(item.id)}
                        className="px-4 py-1.5 bg-[#0ea5e9] text-white rounded text-[13px] hover:bg-sky-400 transition-colors font-sans"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setSettleItemId(null)}
                        className="px-2 py-1.5 text-gray-400 hover:text-white transition-colors font-sans text-[13px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSettleItemId(item.id); }}
                      className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-white transition-colors font-sans"
                    >
                      <CheckCircle2 size={14} /> Settle Total
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <SmartInput onAdd={onAdd} type={type} />
    </div>
  );
}
