import React, { useState } from 'react';
import { evaluate } from 'mathjs';
import { Plus } from 'lucide-react';

export default function SmartInput({ onAdd, type }) {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const items = inputText.split(',').map(s => s.trim()).filter(Boolean);
      
      const parsedItems = items.map(itemStr => {
        // Matches "Some Name" and "50 + 100"
        const match = itemStr.match(/^(.+?)\s+([0-9.+\-*/()\s]+)$/);
        
        if (!match) {
          throw new Error(`Invalid format in "${itemStr}". Need name and amount.`);
        }

        const name = match[1].trim();
        const expr = match[2].trim();

        const amount = evaluate(expr);
        if (isNaN(amount) || amount === Infinity) {
          throw new Error(`Invalid calculation in "${expr}"`);
        }
        
        return {
          person_name: name,
          type,
          status: 'Pending',
          entries: [{
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            desc: 'Added',
            amount: Number(amount)
          }]
        };
      });

      // Add all parsed items
      parsedItems.forEach(item => onAdd(item));
      
      setInputText('');
      setError('');
    } catch (err) {
      setError(err.message || "Invalid format. Use 'Name 100, Other 50+10'");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-[#1e1e1e] p-3 rounded-lg border border-[#333333] mt-2 shadow-sm">
      <div className="flex gap-2 items-center">
        <input 
          type="text" 
          placeholder="e.g. Father Connvince 100, Shampoo 50" 
          value={inputText} 
          onChange={e => setInputText(e.target.value)}
          className="flex-1 bg-black border border-[#333333] rounded px-3 py-1.5 text-[14px] focus:outline-none focus:border-sky-500 transition-colors font-sans text-white placeholder-gray-500"
        />
        <button type="submit" className="p-1.5 bg-[#0ea5e9] text-white rounded hover:bg-sky-400 transition-colors shrink-0">
          <Plus size={18} />
        </button>
      </div>
      {error && <p className="text-red-400 text-[12px]">{error}</p>}
    </form>
  );
}
