// assets/js/telegram_pusher.js

function getUnsentBills() {
  return JSON.parse(localStorage.getItem('bills')) || [];
}

async function sendBillViaVercelAPI(bill) {
  try {
    const response = await fetch('/api/sendToTelegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill)
    });

    const result = await response.json();
    if (!result.success) {
      console.error('Telegram error:', result.error);
    } else {
      console.log('Telegram message sent:', result.data);
    }
  } catch (err) {
    console.error('Vercel API error:', err);
  }
}

async function sendUnsentBillsToTelegram() {
  const bills = getUnsentBills();

  for (const bill of bills) {
    await sendBillViaVercelAPI(bill);
  }
}

// Send every 5 minutes
setInterval(sendUnsentBillsToTelegram, 10 * 1000);

// Also run once at page load
sendUnsentBillsToTelegram();
