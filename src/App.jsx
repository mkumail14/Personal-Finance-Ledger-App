import React, { useState, useEffect } from 'react';
import { seedAccounts, seedLedgers } from './data/seedData';
import AccountsDashboard from './components/AccountsDashboard';
import Ledger from './components/Ledger';
import { formatPKR } from './lib/utils';
import { PenTool, Database } from 'lucide-react';
import { collection, onSnapshot, addDoc, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

function App() {
  const [accounts, setAccounts] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAccounts = onSnapshot(collection(db, 'Accounts'), (snapshot) => {
      setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const unsubLedgers = onSnapshot(collection(db, 'Ledgers'), (snapshot) => {
      setLedgers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);

    return () => {
      unsubAccounts();
      unsubLedgers();
    };
  }, []);

  const handleAddLedger = async (newItem) => {
    try {
      const existing = ledgers.find(
        l => l.person_name.toLowerCase() === newItem.person_name.toLowerCase() 
             && l.type === newItem.type 
             && l.status === 'Pending'
      );

      if (existing) {
        const ref = doc(db, 'Ledgers', existing.id);
        const updatedEntries = [...(existing.entries || []), ...newItem.entries];
        await updateDoc(ref, { entries: updatedEntries });
      } else {
        await addDoc(collection(db, 'Ledgers'), newItem);
      }
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("Failed to add ledger item.");
    }
  };

  const handleSettle = async (ledgerId, accountId) => {
    const item = ledgers.find(l => l.id === ledgerId);
    const acc = accounts.find(a => a.id === accountId);
    if (!item || !acc) return;

    const totalAmount = (item.entries || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    try {
      const adjustment = item.type === 'Receivable' ? totalAmount : -totalAmount;
      
      const batch = writeBatch(db);
      
      const ledgerRef = doc(db, 'Ledgers', ledgerId);
      batch.update(ledgerRef, { status: 'Settled' });
      
      const accountRef = doc(db, 'Accounts', accountId);
      batch.update(accountRef, { balance: acc.balance + adjustment });
      
      await batch.commit();
    } catch (err) {
      console.error("Error settling account: ", err);
      alert("Failed to settle account.");
    }
  };

  const handleSeedDatabase = async () => {
    try {
      const batch = writeBatch(db);
      
      seedAccounts.forEach(acc => {
        const ref = doc(collection(db, 'Accounts'));
        batch.set(ref, { name: acc.name, balance: acc.balance });
      });
      
      seedLedgers.forEach(l => {
        const ref = doc(collection(db, 'Ledgers'));
        batch.set(ref, { person_name: l.person_name, type: l.type, entries: l.entries || [], status: l.status });
      });
      
      await batch.commit();
      alert('Database seeded successfully!');
    } catch (err) {
      console.error("Error seeding database: ", err);
      alert("Failed to seed database. Check Firestore rules.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading ledger...</div>;
  }

  // Calculate Net Total
  const pendingReceivables = ledgers.filter(l => l.type === 'Receivable' && l.status === 'Pending').reduce((a, b) => {
    const itemTotal = (b.entries || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return a + itemTotal;
  }, 0);
  const pendingPayables = ledgers.filter(l => l.type === 'Payable' && l.status === 'Pending').reduce((a, b) => {
    const itemTotal = (b.entries || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return a + itemTotal;
  }, 0);
  const netPending = pendingReceivables - pendingPayables;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-notepad-line">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-notepad-paper rounded-lg border border-notepad-line">
            <PenTool className="text-notepad-accent" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Ledger Note</h1>
        </div>
        
        <div className="flex items-center gap-6">
          {accounts.length === 0 && (
            <button 
              onClick={handleSeedDatabase}
              className="flex items-center gap-2 text-xs bg-notepad-accent/10 text-notepad-accent border border-notepad-accent/20 px-3 py-1.5 rounded-md hover:bg-notepad-accent/20 transition-colors"
            >
              <Database size={14} />
              Seed DB
            </button>
          )}
          
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Outstanding</p>
            <p className={`font-mono text-xl font-medium px-3 py-1 rounded-md bg-notepad-paper border border-notepad-line ${netPending >= 0 ? 'text-notepad-positive' : 'text-notepad-negative'}`}>
              {netPending > 0 ? '+' : ''}{formatPKR(netPending)}
            </p>
          </div>
        </div>
      </header>

      <main>
        <AccountsDashboard accounts={accounts} receivablesTotal={pendingReceivables} />
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <Ledger 
            title="Dues (Receivables)" 
            type="Receivable" 
            items={ledgers} 
            accounts={accounts}
            onAdd={handleAddLedger}
            onSettle={handleSettle}
          />
          <Ledger 
            title="To Pay (Payables)" 
            type="Payable" 
            items={ledgers} 
            accounts={accounts}
            onAdd={handleAddLedger}
            onSettle={handleSettle}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
