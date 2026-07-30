import React from 'react';
import { Shield, ShieldAlert } from 'lucide-react';

export default function NetworkManager({ network }) {
  return (
    <div className="mt-8 border-t border-notepad-line pt-6">
      <h2 className="text-lg font-semibold text-notepad-text mb-4">Network & Contacts</h2>
      <div className="flex flex-wrap gap-2">
        {network.map(person => {
          const isEnemy = person.relationship_tier === 'Enemy';
          return (
            <div 
              key={person.id} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all hover:scale-105 ${
                isEnemy 
                  ? 'border-notepad-negative/30 bg-notepad-negative/10 text-notepad-negative' 
                  : 'border-notepad-line bg-notepad-paper text-gray-300'
              }`}
            >
              {isEnemy ? <ShieldAlert size={14} /> : <Shield size={14} className="text-notepad-accent/50" />}
              {person.name}
              <span className="text-xs opacity-50 ml-1">({person.relationship_tier})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
