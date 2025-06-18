
const BOT_TOKEN = '8122527070:AAHTI-OWa8VIyPUFGFmuSN6_JE24cnLhN9U';
const CHAT_ID = 5154326503;

function sendUnsentBillsToTelegram() {
  const bills = JSON.parse(localStorage.getItem('bills') || '[]');
  const sent = JSON.parse(localStorage.getItem('sent_bills') || '[]');

  const unsent = bills.filter(b =>
    !sent.some(s => s.time === b.time && s.amount === b.amount)
  );

  unsent.forEach(bill => {
    const message = `Item: ${bill.name}\nAmount: ₹${bill.amount}\nTime: ${bill.time}`;
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    });
    sent.push(bill);
  });

  localStorage.setItem('sent_bills', JSON.stringify(sent));
}

setInterval(sendUnsentBillsToTelegram, 10 * 1000);
