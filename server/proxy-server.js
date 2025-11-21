const express = require("express");
const cors = require("cors");
const DeepSeekClient = require("./deepseek");
const { json } = express;

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

// 流式聊天接口
app.post("/api/chat/stream", async (req, res) => {
  const DEEPSEEK_API_KEY = "sk-f40cf544baab492184141ac694ea319e";
  try {
    const { messages, model = "deepseek-chat" } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res
        .status(400)
        .json({ error: "messages 参数是必需的且必须是数组" });
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const deepseek = new DeepSeekClient(DEEPSEEK_API_KEY);

    await deepseek.chatStream(messages, model, (chunk, fullContent) => {
      res.write(chunk);
    });

    res.end();
  } catch (error) {
    console.error("流式聊天错误:", error);
    res.status(500).end();
  }
});

app.listen(3002, () => {
  console.log("Proxy server running on http://localhost:3002");
});
