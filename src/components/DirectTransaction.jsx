import React, { useState } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

export default function DirectTransaction({ accounts, onTransaction }) {
  const [type, setType] = useState('Credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0 || !accountId) return;

    onTransaction({
      type,
      amount: Number(amount),
      description: description || (type === 'Credit' ? 'Direct Deposit' : 'Direct Withdrawal'),
      accountId
    });

    setAmount('');
    setDescription('');
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#333333] p-6 mb-8">
      <h2 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Quick Transfer</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full flex flex-col gap-1">
          <label className="text-xs text-gray-500">Account</label>
          <select 
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full bg-[#222] border border-[#333] text-white rounded-lg px-3 py-2 text-sm focus:border-[#0ea5e9] focus:outline-none"
            required
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 w-full flex flex-col gap-1">
          <label className="text-xs text-gray-500">Type</label>
          <div className="flex bg-[#222] border border-[#333] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setType('Credit')}
              className={`flex-1 py-1 text-sm rounded-md transition-colors ${type === 'Credit' ? 'bg-[#0ea5e9] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Credit
            </button>
            <button
              type="button"
              onClick={() => setType('Debit')}
              className={`flex-1 py-1 text-sm rounded-md transition-colors ${type === 'Debit' ? 'bg-[#0ea5e9] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Debit
            </button>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col gap-1">
          <label className="text-xs text-gray-500">Amount</label>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-[#222] border border-[#333] text-white rounded-lg px-3 py-2 text-sm focus:border-[#0ea5e9] focus:outline-none font-mono"
            required
          />
        </div>

        <div className="flex-[2] w-full flex flex-col gap-1">
          <label className="text-xs text-gray-500">Description</label>
          <input 
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Salary, Groceries"
            className="w-full bg-[#222] border border-[#333] text-white rounded-lg px-3 py-2 text-sm focus:border-[#0ea5e9] focus:outline-none"
          />
        </div>

        <button 
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-[#0ea5e9] text-white rounded-lg text-sm font-medium hover:bg-sky-400 transition-colors flex items-center justify-center gap-2"
        >
          {type === 'Credit' ? <PlusCircle size={16} /> : <MinusCircle size={16} />}
          Apply
        </button>
      </form>
    </div>
  );
}
