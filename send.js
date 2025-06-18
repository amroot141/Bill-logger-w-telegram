export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { name, amount, payment, time } = req.body;

  const token = '8122527070:AAHTI-OWa8VIyPUFGFmuSN6_JE24cnLhN9U';
  const chatId = '5154326503';

  const message = `🧾 *Bill Alert*
Item: ${name}
Amount: ₹${amount}
Mode: ${payment}
Time: ${time}`;

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
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
