
import { GoogleGenAI } from "@google/genai";
import { LogEntry, Campaign } from "../types";

export const geminiService = {
  getDailySummary: async (logs: LogEntry[], date: string): Promise<string> => {
    if (logs.length === 0) return "Bugün için henüz bir kayıt bulunmuyor.";
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const logsSummary = logs.map(l => `${l.userName}: ${l.content} (${l.tag})`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Aşağıdaki iş kayıtlarını analiz et ve bu ekip için motive edici, profesyonel bir günlük özet çıkar (Maksimum 3 cümle). Dil: Türkçe.
        Tarih: ${date}
        Kayıtlar:
        ${logsSummary}`,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        },
      });

      return response.text || "Özet oluşturulamadı.";
    } catch (error) {
      console.error("Gemini summary error:", error);
      return "Yapay zeka özeti şu an kullanılamıyor.";
    }
  },

  getDeepAnalysis: async (logs: LogEntry[], campaigns: Campaign[]): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const logsStr = logs.slice(0, 20).map(l => `[${l.date}] ${l.userName}: ${l.content}`).join('\n');
      const campaignsStr = campaigns.map(c => `${c.brandName} - ${c.campaignName}`).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Sen profesyonel bir ajans danışmanısın. Aşağıdaki son iş kayıtlarını ve aktif kampanyaları incele. 
        Ekibin verimliliğini artırmak için derin bir analiz yap ve stratejik tavsiyeler ver. 
        Yanıtın profesyonel, yapıcı ve vizyoner olmalı. Dil: Türkçe.

        AKTİF KAMPANYALAR:
        ${campaignsStr}

        SON İŞ KAYITLARI:
        ${logsStr}`,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        },
      });

      return response.text || "Analiz raporu oluşturulamadı.";
    } catch (error) {
      console.error("Gemini analysis error:", error);
      return "Derin analiz şu an gerçekleştirilemiyor.";
    }
  }
};
