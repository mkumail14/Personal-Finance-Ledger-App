import React, { useState, useEffect } from 'react';
import AccountsDashboard from './components/AccountsDashboard';
import Ledger from './components/Ledger';
import DirectTransaction from './components/DirectTransaction';
import TransactionHistory from './components/TransactionHistory';
import { formatPKR } from './lib/utils';
import { PenTool, Lock } from 'lucide-react';
import { collection, onSnapshot, addDoc, doc, writeBatch, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubAccounts = onSnapshot(collection(db, 'Accounts'), (snapshot) => {
      setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const unsubLedgers = onSnapshot(collection(db, 'Ledgers'), (snapshot) => {
      setLedgers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const q = query(collection(db, 'Transactions'), orderBy('timestamp', 'desc'));
    const unsubTransactions = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);

    return () => {
      unsubAccounts();
      unsubLedgers();
      unsubTransactions();
    };
  }, [isAuthenticated]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '2406') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleAddLedger = async (newItem) => {
    try {
      const existing = ledgers.find(
        l => l.person_name.toLowerCase() === newItem.person_name.toLowerCase() 
             && l.type === newItem.type 
             && l.status === 'Pending'
      );

      const totalNewAmount = newItem.entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      const batch = writeBatch(db);

      if (existing) {
        const ref = doc(db, 'Ledgers', existing.id);
        const updatedEntries = [...(existing.entries || []), ...newItem.entries];
        batch.update(ref, { entries: updatedEntries });
      } else {
        const ref = doc(collection(db, 'Ledgers'));
        batch.set(ref, newItem);
      }

      // Log transaction
      const transRef = doc(collection(db, 'Transactions'));
      batch.set(transRef, {
        type: 'Add Ledger',
        amount: totalNewAmount,
        description: `Added pending ${newItem.type} for ${newItem.person_name}`,
        timestamp: serverTimestamp()
      });

      await batch.commit();
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

      // Log transaction
      const transRef = doc(collection(db, 'Transactions'));
      batch.set(transRef, {
        type: 'Settle',
        amount: totalAmount,
        description: `Settled ${item.type} for ${item.person_name}`,
        accountId: accountId,
        timestamp: serverTimestamp()
      });
      
      await batch.commit();
    } catch (err) {
      console.error("Error settling account: ", err);
      alert("Failed to settle account.");
    }
  };

  const handleDirectTransaction = async (data) => {
    try {
      const acc = accounts.find(a => a.id === data.accountId);
      if (!acc) return;

      const adjustment = data.type === 'Credit' ? data.amount : -data.amount;

      const batch = writeBatch(db);
      
      const accountRef = doc(db, 'Accounts', data.accountId);
      batch.update(accountRef, { balance: acc.balance + adjustment });

      const transRef = doc(collection(db, 'Transactions'));
      batch.set(transRef, {
        ...data,
        timestamp: serverTimestamp()
      });

      await batch.commit();
    } catch (err) {
      console.error("Error applying direct transaction: ", err);
      alert("Failed to process transaction.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-[#333333] w-full max-w-sm shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 bg-[#222222] rounded-full flex items-center justify-center mb-6">
            <Lock className="text-[#0ea5e9]" size={32} />
          </div>
          <h1 className="text-2xl font-light text-white mb-2">Ledger Note</h1>
          <p className="text-gray-500 text-sm mb-8 text-center">Enter PIN to access your finance ledger</p>
          
          <form onSubmit={handlePinSubmit} className="w-full flex flex-col gap-4">
            <input 
              type="password" 
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                setPinError(false);
              }}
              placeholder="Enter PIN"
              className={`w-full bg-black border ${pinError ? 'border-red-500' : 'border-[#333333] focus:border-[#0ea5e9]'} rounded-xl px-4 py-3 text-center text-xl tracking-widest text-white transition-colors focus:outline-none font-mono`}
              autoFocus
            />
            {pinError && <p className="text-red-500 text-xs text-center">Incorrect PIN. Try again.</p>}
            <button 
              type="submit"
              className="w-full bg-[#0ea5e9] text-white rounded-xl py-3 font-medium hover:bg-sky-400 transition-colors mt-2"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

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
        
        <DirectTransaction accounts={accounts} onTransaction={handleDirectTransaction} />

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

        <TransactionHistory transactions={transactions} accounts={accounts} />
      </main>
    </div>
  );
}

export default App;
