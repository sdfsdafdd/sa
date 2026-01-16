
export enum WorkTag {
  ADVERTISING = 'Reklam',
  DESIGN = 'Tasarım'
}

export enum CampaignStatus {
  UPCOMING = 'Yaklaşan',
  ACTIVE = 'Aktif',
  ENDED = 'Tamamlandı'
}

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO format (YYYY-MM-DD)
  content: string;
  tag: WorkTag;
  createdAt: number;
  campaignId?: string;
  isDeleted: boolean; // Soft delete alanı
}

export interface Campaign {
  id: string;
  userId: string;
  userName: string;
  brandName: string;
  campaignName: string;
  notes: string;
  startDate: string; // ISO format (YYYY-MM-DDTHH:mm)
  endDate: string;   // ISO format (YYYY-MM-DDTHH:mm)
  createdAt: number;
  isDeleted: boolean; // Soft delete alanı
}
