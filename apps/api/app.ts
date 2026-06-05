const express = require("express");
const cors = require("cors");

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "working",
    message: "Serwer Express działa idealnie!",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serwer wystartował na porcie: http://localhost:${PORT}`);
});
