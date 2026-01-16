
import { LogEntry, Campaign } from '../types';

const LOGS_KEY = 'ess_logs_v1';
const CAMPAIGNS_KEY = 'ess_campaigns_v1';

export const dbService = {
  // --- Logs ---
  getLogs: async (includeHidden = false): Promise<LogEntry[]> => {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      if (!data) return [];
      const logs: LogEntry[] = JSON.parse(data);
      return includeHidden ? logs : logs.filter(l => l.isDeleted === false || l.isDeleted === undefined);
    } catch (e) {
      console.error("Kayıtlar yüklenirken hata oluştu:", e);
      return [];
    }
  },

  getHiddenLogs: async (): Promise<LogEntry[]> => {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      if (!data) return [];
      const logs: LogEntry[] = JSON.parse(data);
      return logs.filter(l => l.isDeleted === true);
    } catch (e) {
      return [];
    }
  },

  saveLog: async (log: LogEntry): Promise<void> => {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      let allLogs: LogEntry[] = data ? JSON.parse(data) : [];
      const existingIndex = allLogs.findIndex(l => l.id === log.id);
      const logToSave = { ...log, isDeleted: log.isDeleted === true };

      if (existingIndex > -1) {
        allLogs[existingIndex] = logToSave;
      } else {
        allLogs.push(logToSave);
      }
      localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));
    } catch (e) {
      throw new Error("Kayıt veritabanına yazılamadı.");
    }
  },

  hideLog: async (logId: string, userId: string): Promise<void> => {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      if (!data) return;
      const allLogs: LogEntry[] = JSON.parse(data);
      const updatedLogs = allLogs.map(l => 
        l.id === logId ? { ...l, isDeleted: true } : l
      );
      localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
    } catch (e: any) {
      throw new Error("Kayıt çöp kutusuna taşınamadı.");
    }
  },

  restoreLog: async (logId: string): Promise<void> => {
    const data = localStorage.getItem(LOGS_KEY);
    if (!data) return;
    const allLogs: LogEntry[] = JSON.parse(data);
    const updatedLogs = allLogs.map(l => l.id === logId ? { ...l, isDeleted: false } : l);
    localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
  },

  deleteLogPermanently: async (logId: string): Promise<void> => {
    const data = localStorage.getItem(LOGS_KEY);
    if (!data) return;
    const allLogs: LogEntry[] = JSON.parse(data);
    const updatedLogs = allLogs.filter(l => l.id !== logId);
    localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
  },

  // --- Campaigns ---
  getCampaigns: async (includeHidden = false): Promise<Campaign[]> => {
    try {
      const data = localStorage.getItem(CAMPAIGNS_KEY);
      if (!data) return [];
      const campaigns: Campaign[] = JSON.parse(data);
      // Filtreleme: isDeleted false olanlar veya hiç isDeleted özelliği olmayanlar kalsın
      return includeHidden ? campaigns : campaigns.filter(c => c.isDeleted === false || c.isDeleted === undefined);
    } catch (e) {
      return [];
    }
  },

  getHiddenCampaigns: async (): Promise<Campaign[]> => {
    try {
      const data = localStorage.getItem(CAMPAIGNS_KEY);
      if (!data) return [];
      const campaigns: Campaign[] = JSON.parse(data);
      return campaigns.filter(c => c.isDeleted === true);
    } catch (e) {
      return [];
    }
  },

  saveCampaign: async (campaign: Campaign): Promise<void> => {
    try {
      const data = localStorage.getItem(CAMPAIGNS_KEY);
      let allCampaigns: Campaign[] = data ? JSON.parse(data) : [];
      const existingIndex = allCampaigns.findIndex(c => c.id === campaign.id);
      const campaignToSave = { ...campaign, isDeleted: campaign.isDeleted === true };

      if (existingIndex > -1) {
        allCampaigns[existingIndex] = campaignToSave;
      } else {
        allCampaigns.push(campaignToSave);
      }
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(allCampaigns));
    } catch (e) {
      throw new Error("Kampanya kaydedilemedi.");
    }
  },

  hideCampaign: async (campaignId: string, userId: string): Promise<void> => {
    try {
      const data = localStorage.getItem(CAMPAIGNS_KEY);
      if (!data) return;
      const allCampaigns: Campaign[] = JSON.parse(data);
      const updated = allCampaigns.map(c => 
        c.id === campaignId ? { ...c, isDeleted: true } : c
      );
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated));
    } catch (e) {
      throw new Error("Silme işlemi başarısız.");
    }
  },

  hideAllCampaigns: async (): Promise<void> => {
    const data = localStorage.getItem(CAMPAIGNS_KEY);
    if (!data) return;
    const allCampaigns: Campaign[] = JSON.parse(data);
    const updated = allCampaigns.map(c => ({ ...c, isDeleted: true }));
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated));
  },

  restoreCampaign: async (campaignId: string): Promise<void> => {
    const data = localStorage.getItem(CAMPAIGNS_KEY);
    if (!data) return;
    const allCampaigns: Campaign[] = JSON.parse(data);
    const updated = allCampaigns.map(c => c.id === campaignId ? { ...c, isDeleted: false } : c);
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated));
  },

  deleteCampaignPermanently: async (campaignId: string): Promise<void> => {
    const data = localStorage.getItem(CAMPAIGNS_KEY);
    if (!data) return;
    const allCampaigns: Campaign[] = JSON.parse(data);
    const updated = allCampaigns.filter(c => c.id !== campaignId);
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated));
  }
};
