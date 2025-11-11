import express, { json } from "express";
import cors from "cors";
const app = express();

app.use(cors());
app.use(json());

app.post("/proxy/translate", async (req, res) => {
  try {
    const response = await fetch(
      "https://fanyi-api.baidu.com/api/trans/vip/translate",
      {
        method: "POST",
        body: new URLSearchParams(req.body),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3002, () => {
  console.log("Proxy server running on http://localhost:3002");
});
