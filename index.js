import express from 'express';
import fetch from 'node-fetch'; // Use `import` instead of `require`

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const METRONOME_ENDPOINT = 'https://api.metronome.com/v1/ingest';
const API_TOKEN = 'b591013cd32f59db334be371d5775e823ee41abc6890932f1cd5498189ff79b0';

function generateRandomHex(len) {
  const chars = 'abcdef0123456789';
  return Array.from({ length: len }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

app.post('/send-event', async (req, res) => {
  try {
    const { customer_id, warehouse_id, compute_hours, region, cloud_provider, storage_usage_gb } = req.body;

    const transactionID = `${new Date().toISOString()}_cluster${generateRandomHex(3)}`;

    const payload = [
      {
        transaction_id: transactionID,
        customer_id,
        event_type: 'compute_event',
        timestamp: new Date().toISOString(),
        properties: {
          warehouse_id,
          compute_hours: parseFloat(compute_hours),
          cloud_provider,
          region,
          warehouse_size: req.body.warehouse_size,
          storage_usage_gb: parseFloat(storage_usage_gb)
        }
      }
    ];

    const response = await fetch(METRONOME_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    res.status(200).json({ message: 'Event sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send event' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
