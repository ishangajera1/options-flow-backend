const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

function getDummyData() {
  return [
    {
      symbol: "AAPL",
      sentiment: "BULLISH",
      options: [
        { strike: 200, type: "C", volume: 12000, oi: 5000 },
        { strike: 190, type: "P", volume: 3000, oi: 4000 }
      ]
    },
    {
      symbol: "NVDA",
      sentiment: "BEARISH",
      options: [
        { strike: 450, type: "C", volume: 5000, oi: 6000 },
        { strike: 440, type: "P", volume: 15000, oi: 8000 }
      ]
    }
  ];
}

app.get('/api/options-flow', (req, res) => {
  res.json(getDummyData());
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
