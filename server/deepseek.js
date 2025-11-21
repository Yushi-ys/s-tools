// deepseek.js
require('dotenv').config();
const OpenAI = require("openai");

class DeepSeekClient {
  constructor(apiKey) {
    this.openai = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: apiKey,
    });
  }

  /**
   * 普通聊天完成
   */
  async chat(messages, model = "deepseek-chat") {
    try {
      const completion = await this.openai.chat.completions.create({
        messages,
        model,
        stream: false,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("DeepSeek API 错误:", error);
      throw error;
    }
  }

  /**
   * 流式聊天完成
   */
  async chatStream(messages, model = "deepseek-chat", onMessage) {
    try {
      const stream = await this.openai.chat.completions.create({
        messages,
        model,
        stream: true,
      });

      let fullContent = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullContent += content;

        if (onMessage) {
          onMessage(content, fullContent);
        }
      }

      return fullContent;
    } catch (error) {
      console.error("DeepSeek API 错误:", error);
      throw error;
    }
  }
}

module.exports = DeepSeekClient;
