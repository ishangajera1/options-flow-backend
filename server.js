const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

const apiKey = process.env.API_KEY; // Finnhub API key

async function getFinnhubData() {
  const symbols = ["AAPL", "NVDA"]; // You can change later
  const results = [];

  for (const symbol of symbols) {
    const url = `https://finnhub.io/api/v1/stock/options?symbol=${symbol}&token=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Finnhub API failed for ${symbol}: ${response.statusText}`);
    }

    const data = await response.json();

    // If Finnhub returns nothing, skip this symbol
    if (!data.data || data.data.length === 0) {
      console.warn(`No data for ${symbol}`);
      continue;
    }

    // Nearest expiry
    const nearestExpiry = data.data[0];
    const calls = nearestExpiry.options.CALL || [];
    const puts = nearestExpiry.options.PUT || [];

    // Sentiment: compare real volumes
    const callVolume = calls.reduce((sum, o) => sum + (o.volume || 0), 0);
    const putVolume = puts.reduce((sum, o) => sum + (o.volume || 0), 0);
    const sentiment = callVolume > putVolume ? "BULLISH" : "BEARISH";

    results.push({
      symbol,
      sentiment,
      calls: calls.slice(0, 5),
      puts: puts.slice(0, 5)
    });
  }

  return results;
}

app.get('/api/options-flow', async (req, res) => {
  try {
    const liveData = await getFinnhubData();
    if (liveData.length === 0) {
      return res.status(404).json({ error: 'No data available' });
    }
    res.json(liveData);
  } catch (err) {
    console.error('Finnhub error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
