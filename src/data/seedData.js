export const seedAccounts = [
  { id: '1', name: 'Bank', balance: 3850 },
  { id: '2', name: 'Wallet 1', balance: 5300 },
  { id: '3', name: 'Wallet 2', balance: 5300 },
  { id: '4', name: 'Baba Account', balance: 8000 },
];

export const seedLedgers = [
  { 
    person_name: 'Baba', 
    type: 'Receivable', 
    status: 'Pending',
    entries: [{ id: 'seed_1', desc: 'Initial Balance', amount: 211 }]
  },
  { 
    person_name: 'Abbas', 
    type: 'Receivable', 
    status: 'Pending',
    entries: [{ id: 'seed_2', desc: 'Initial Balance', amount: 1990 }]
  },
  { 
    person_name: 'Dadi', 
    type: 'Payable', 
    status: 'Pending',
    entries: [
      { id: 'seed_3', desc: 'Lassi', amount: 1360 },
      { id: 'seed_4', desc: 'Milk', amount: 500 }
    ]
  }
];

export const seedNetwork = [
  { id: 'n1', name: 'Hibah', relationship_tier: 'Best Friend' },
  { id: 'n2', name: 'Shaheer', relationship_tier: 'Friends' },
  { id: 'n3', name: 'Mohsin', relationship_tier: 'Friends' },
  { id: 'n4', name: 'Kashan', relationship_tier: 'Enemy' }, 
];
