export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed.' });
  }

  // Telegram Bot Config
  const token = '8122527070:AAHTI-OWa8VIyPUFGFmuSN6_JE24cnLhN9U';
  const chatId = '5154326503';

  // Support both single bill & full summary
  const { text, name, amount, payment, time } = req.body;

  // Build the message content
  const message = text || `🧾 *Bill Alert*\nItem: ${name}\nAmount: ₹${amount}\nMode: ${payment}\nTime: ${time}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await tgRes.json();
    if (!data.ok) throw new Error(data.description);

    res.status(200).json({ ok: true, message: 'Telegram message sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message: ' + err.message });
  }
}
