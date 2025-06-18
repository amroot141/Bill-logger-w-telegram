// assets/js/telegram_pusher.js

// ======================
// Core Functions
// ======================

function getAllBills() {
  return JSON.parse(localStorage.getItem('bills')) || [];
}

function getUnsentBills() {
  const allBills = getAllBills();
  return allBills.filter(bill => 
    !bill.isSent && 
    (bill.sendAttempts || 0) < 3 // Max 3 attempts
  );
}

function updateBill(billId, updates) {
  const bills = getAllBills();
  const updatedBills = bills.map(bill => 
    bill.id === billId ? { ...bill, ...updates } : bill
  );
  localStorage.setItem('bills', JSON.stringify(updatedBills));
}

// ======================
// Telegram Integration
// ======================

async function sendSingleBill(bill) {
  try {
    console.log(`Attempting to send bill ${bill.id}`);
    
    const response = await fetch('/api/send.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Mark as sent only after successful delivery
    updateBill(bill.id, {
      isSent: true,
      sentAt: new Date().toISOString(),
      sendAttempts: (bill.sendAttempts || 0) + 1
    });

    console.log(`Successfully sent bill ${bill.id}`);
    return true;
  } catch (error) {
    // Increment attempt counter
    updateBill(bill.id, {
      sendAttempts: (bill.sendAttempts || 0) + 1
    });
    
    console.error(`Failed to send bill ${bill.id}:`, error);
    return false;
  }
}

// ======================
// Main Controller
// ======================

async function sendUnsentBills() {
  const unsentBills = getUnsentBills();
  
  if (unsentBills.length === 0) {
    console.log('No bills to send');
    return;
  }

  console.log(`Found ${unsentBills.length} unsent bills`);
  
  for (const bill of unsentBills) {
    await sendSingleBill(bill);
    // Small delay between sends to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// ======================
// Initialization
// ======================

// Start sending every 5 minutes
const sendingInterval = setInterval(sendUnsentBills, 5 * 60 * 1000);

// Run immediately on page load
document.addEventListener('DOMContentLoaded', () => {
  sendUnsentBills();
});

// For debugging: window.stopSending = () => clearInterval(sendingInterval);
