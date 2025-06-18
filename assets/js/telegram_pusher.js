// Configuration
const BILLS_KEY = 'bills';
const SEND_DELAY_MS = 500;
const MAX_ATTEMPTS = 3;

// Atomic bill locking mechanism
const pendingSends = new Set();

async function processUnsentBills() {
  const bills = JSON.parse(localStorage.getItem(BILLS_KEY)) || [];
  const now = new Date();

  for (const bill of bills) {
    // Skip if: already sent, exceeded attempts, or currently being sent
    if (bill.isSent || 
        (bill.sendAttempts || 0) >= MAX_ATTEMPTS ||
        pendingSends.has(bill.id)) {
      continue;
    }

    // Lock this bill for processing
    pendingSends.add(bill.id);
    
    try {
      console.log(`Attempting to send bill ${bill.id}`);
      await sendBillToTelegram(bill);
      
      // Only mark as sent after successful delivery
      const updatedBills = JSON.parse(localStorage.getItem(BILLS_KEY)).map(b => 
        b.id === bill.id ? { 
          ...b, 
          isSent: true,
          sentAt: now.toISOString(),
          sendAttempts: (b.sendAttempts || 0) + 1
        } : b
      );
      
      localStorage.setItem(BILLS_KEY, JSON.stringify(updatedBills));
      console.log(`Successfully sent bill ${bill.id}`);
    } catch (error) {
      console.error(`Failed to send bill ${bill.id}:`, error);
      // Update attempt count but keep as unsent
      const updatedBills = JSON.parse(localStorage.getItem(BILLS_KEY)).map(b => 
        b.id === bill.id ? { 
          ...b, 
          sendAttempts: (b.sendAttempts || 0) + 1 
        } : b
      );
      localStorage.setItem(BILLS_KEY, JSON.stringify(updatedBills));
    } finally {
      // Release lock
      pendingSends.delete(bill.id);
      await new Promise(resolve => setTimeout(resolve, SEND_DELAY));
    }
  }
}

// Telegram API communication
async function sendBillToTelegram(bill) {
  const response = await fetch('/api/send.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: bill.name,
      amount: bill.amount,
      payment: bill.payment,
      time: bill.time
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json();
}

// Update bill in storage
function updateBillStatus(billId, updates) {
  const bills = JSON.parse(localStorage.getItem(BILLS_KEY)) || [];
  const updatedBills = bills.map(bill => 
    bill.id === billId ? { ...bill, ...updates } : bill
  );
  localStorage.setItem(BILLS_KEY, JSON.stringify(updatedBills));
}

// Cleanup old bills (runs daily)
function cleanupOldBills() {
  const bills = JSON.parse(localStorage.getItem(BILLS_KEY)) || [];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.time || bill.sentAt);
    return billDate > oneWeekAgo;
  });

  localStorage.setItem(BILLS_KEY, JSON.stringify(filteredBills));
}

// Initialize
setInterval(processUnsentBills, 5 * 60 * 1000); // Check every 5 minutes
setInterval(cleanupOldBills, 24 * 60 * 60 * 1000); // Cleanup daily
document.addEventListener('DOMContentLoaded', processUnsentBills);
