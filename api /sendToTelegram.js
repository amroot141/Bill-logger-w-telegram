export default async function handler(req, res) {
  const { name, amount, payment, time } = req.body;

  const BOT_TOKEN = '8122527070:AAHTI-OWa8VIyPUFGFmuSN6_JE24cnLhN9U';
  const CHAT_ID = '5154326503';

  const message = `🧾 *Bill Alert*\nItem: ${name}\nAmount: ₹${amount}\nMode: ${payment}\nTime: ${time}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
