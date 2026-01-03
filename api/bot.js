
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  const token = process.env.BOT_TOKEN;
  const apiKey = process.env.API_KEY;
  const tgUrl = `https://api.telegram.org/bot${token}`;

  const sendToTelegram = async (method, body) => {
    return await fetch(`${tgUrl}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  // 1. АНАЛИЗ ТЕСТА (Вызывается из приложения)
  if (req.method === 'POST' && req.body.action === 'analyze') {
    const { userData, questions, answers } = req.body;
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const formattedAnswers = questions.map(q => `${q.text}: ${answers[q.id]}`).join("\n");
      const prompt = `Ты — эксперт-нейролингвист. Проанализируй данные ребенка:
      Возраст: ${userData.age} лет, Пол: ${userData.gender}.
      Ответы: ${formattedAnswers}
      Выдай JSON: { "analysis": "текст", "recommendations": ["пункт1", "пункт2"], "prognosis": "текст", "scientificContext": "ссылка на МКБ" }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Быстрая и умная модель
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              prognosis: { type: Type.STRING },
              scientificContext: { type: Type.STRING }
            },
            required: ["analysis", "recommendations", "prognosis", "scientificContext"]
          }
        }
      });

      const result = JSON.parse(response.text);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // 2. ОТПРАВКА ТЕКСТА В ЧАТ (Вызывается из приложения)
  if (req.method === 'POST' && req.body.action === 'send_text') {
    const { chatId, text } = req.body;
    await sendToTelegram('sendMessage', {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });
    return res.status(200).json({ success: true });
  }

  // 3. ПРИВЕТСТВИЕ БОТА (Webhook от Telegram)
  if (req.method === 'POST') {
    const { message } = req.body;
    if (message?.text === '/start') {
      await sendToTelegram('sendMessage', {
        chat_id: message.chat.id,
        text: `<b>CommuniCare AI: Оценка коммуникации</b>\n\nЗдравствуйте! Я помогу проанализировать развитие вашего ребенка.\n\nНажмите кнопку ниже, чтобы начать тест.`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ 
            text: "🚀 Начать тест", 
            web_app: { url: `https://${req.headers.host}` } 
          }]]
        }
      });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(200).send('API is running');
}
