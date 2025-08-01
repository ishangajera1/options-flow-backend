const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

const apiKey = process.env.API_KEY; // Alpha Vantage API key from Render env vars

async function getAlphaVantageData() {
  // Example: Get AAPL stock data (Alpha Vantage free endpoint)
  const symbols = ["AAPL", "NVDA"];
  const results = [];

  for (const symbol of symbols) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Alpha Vantage API failed for ${symbol}: ${response.statusText}`);
    }

    const data = await response.json();

    // Example: simulate sentiment based on price movement
    const times = Object.keys(data["Time Series (5min)"] || {});
    const latest = data["Time Series (5min)"][times[0]];
    const open = parseFloat(latest["1. open"]);
    const close = parseFloat(latest["4. close"]);
    const sentiment = close > open ? "BULLISH" : "BEARISH";

    results.push({
      symbol,
      sentiment,
      options: [
        { strike: close.toFixed(2), type: "C", volume: Math.floor(Math.random() * 10000), oi: Math.floor(Math.random() * 5000) },
        { strike: close.toFixed(2), type: "P", volume: Math.floor(Math.random() * 10000), oi: Math.floor(Math.random() * 5000) }
      ]
    });
  }

  return results;
}

app.get('/api/options-flow', async (req, res) => {
  try {
    const liveData = await getAlphaVantageData();
    res.json(liveData);
  } catch (err) {
    console.error('Alpha Vantage error:', err.message);
    res.status(500).json({ error: 'Failed to fetch live data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
