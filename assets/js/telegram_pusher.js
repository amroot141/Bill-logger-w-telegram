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
  const bills = JSON.parse(localStorage.getItem('bills')) || [];
  if (bills.length === 0) {
    console.log('No bills to send');
    return;
  }

  // Generate summary
  let summary = "🧾 *Bill Summary*\n";
  let cash = 0, online = 0, total = 0;

  bills.forEach((bill, index) => {
    const { name, amount, payment, time } = bill;
    summary += `${index + 1}. ${name} - ₹${amount} (${payment}) @ ${time}\n`;
    total += parseFloat(amount);
    if (payment === "cash") cash += parseFloat(amount);
    else online += parseFloat(amount);
  });

  summary += `\n💵 Cash: ₹${cash.toFixed(2)}\n💳 Online: ₹${online.toFixed(2)}\n📊 Total: ₹${total.toFixed(2)}\n🕒 ${new Date().toLocaleString()}`;

  try {
    const res = await fetch('/api/send.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: summary })
    });

    const result = await res.json();
    if (result.ok) {
      console.log('Telegram summary sent!');
    } else {
      console.error('Telegram error:', result);
    }
  } catch (err) {
    console.error('Failed to send Telegram summary:', err.message);
  }
}

// Only send summary if time is exactly 10:30 PM
function isTimeToSend() {
  const now = new Date();
  return now.getHours() === 22 && now.getMinutes() === 30;
}

setInterval(() => {
  if (isTimeToSend()) {
    sendUnsentBillsToTelegram();
  }
}, 60 * 1000); // check every 1 minute

// Also run once at page load
document.addEventListener('DOMContentLoaded', () => {
  sendUnsentBillsToTelegram();
});

// For debugging
window.clearBillInterval = () => clearInterval(interval);Add comment
