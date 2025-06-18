export default async function handler(req, res){
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { name, amount, payment, time } = req.body;
// assets/js/telegram_pusher.js

  const token = '8122527070:AAHTI-OWa8VIyPUFGFmuSN6_JE24cnLhN9U';
  const chatId = '5154326503';
// Get only unsent bills
function getUnsentBills() {
  const allBills = JSON.parse(localStorage.getItem('bills')) || [];
  return allBills.filter(bill => !bill.isSent);
}

  const message = `🧾 *Bill Alert*
Item: ${name}
Amount: ₹${amount}
Mode: ${payment}
Time: ${time}`;
// Mark a bill as sent in localStorage
function markBillAsSent(billId) {
  const bills = JSON.parse(localStorage.getItem('bills')) || [];
  const updatedBills = bills.map(bill => {
    if (bill.id === billId) {
      return { ...bill, isSent: true, sentAt: new Date().toISOString() };
    }
    return bill;
  });
  localStorage.setItem('bills', JSON.stringify(updatedBills));
}

async function sendBillViaVercelAPI(bill) {
  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    const response = await fetch('/api/send.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
      body: JSON.stringify(bill)
    });

    const data = await tgRes.json();
    res.status(200).json(data);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Telegram message sent:', bill.id);
    return result;
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error('Failed to send bill:', bill.id, err);
    throw err; // Re-throw to handle in calling function
  }
}

async function sendUnsentBillsToTelegram() {
  const unsentBills = getUnsentBills();
  
  if (unsentBills.length === 0) {
    console.log('No unsent bills found');
    return;
  }

  console.log(`Sending ${unsentBills.length} unsent bills`);

  for (const bill of unsentBills) {
    try {
      await sendBillViaVercelAPI(bill);
      markBillAsSent(bill.id); // Only mark as sent if successful
    } catch (error) {
      console.error('Error processing bill:', bill.id, error);
      // Consider adding retry logic here
    }
  }
}

// Send every 5 minutes
const interval = setInterval(sendUnsentBillsToTelegram, 5 * 60 * 1000);

// Also run once at page load
document.addEventListener('DOMContentLoaded', () => {
  sendUnsentBillsToTelegram();
});

// For debugging
window.clearBillInterval = () => clearInterval(interval);Add comment
