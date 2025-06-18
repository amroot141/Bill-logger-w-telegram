// Configuration
const BILLS_KEY = 'bills';
const SEND_DELAY_MS = 500;
const MAX_ATTEMPTS = 3;

// Main processing function
async function processUnsentBills() {
  const bills = JSON.parse(localStorage.getItem(BILLS_KEY)) || [];
  const sentHashes = new Set();

  // Get all hashes of already sent bills
  bills.forEach(bill => {
    if (bill.isSent) sentHashes.add(bill.hash);
  });

  // Process unsent bills
  for (const bill of bills) {
    if (!bill.isSent && 
        (bill.sendAttempts || 0) < MAX_ATTEMPTS && 
        !sentHashes.has(bill.hash)) {
          
      try {
        await sendBillToTelegram(bill);
        updateBillStatus(bill.id, {
          isSent: true,
          sentAt: new Date().toISOString(),
          sendAttempts: (bill.sendAttempts || 0) + 1
        });
        sentHashes.add(bill.hash);
      } catch (error) {
        console.error(`Failed to send bill ${bill.id}:`, error);
        updateBillStatus(bill.id, {
          sendAttempts: (bill.sendAttempts || 0) + 1
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, SEND_DELAY_MS));
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
