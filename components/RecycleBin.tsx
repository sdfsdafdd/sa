
import React, { useState, useEffect } from 'react';
import { User, LogEntry, Campaign } from '../types';
import { dbService } from '../services/dbService';

interface RecycleBinProps {
  user: User;
  onRefresh: () => void;
}

const RecycleBin: React.FC<RecycleBinProps> = ({ user, onRefresh }) => {
  const [deletedLogs, setDeletedLogs] = useState<LogEntry[]>([]);
  const [deletedCampaigns, setDeletedCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHidden = async () => {
    setIsLoading(true);
    const [logs, campaigns] = await Promise.all([
      dbService.getHiddenLogs(),
      dbService.getHiddenCampaigns()
    ]);
    setDeletedLogs(logs);
    setDeletedCampaigns(campaigns);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHidden();
  }, []);

  const handleRestoreLog = async (id: string) => {
    await dbService.restoreLog(id);
    fetchHidden();
    onRefresh();
  };

  const handlePermanentDeleteLog = async (id: string) => {
    if (!confirm('Bu kayıt kalıcı olarak silinecek. Emin misiniz?')) return;
    await dbService.deleteLogPermanently(id);
    fetchHidden();
    onRefresh();
  };

  const handleRestoreCampaign = async (id: string) => {
    await dbService.restoreCampaign(id);
    fetchHidden();
    onRefresh();
  };

  const handlePermanentDeleteCampaign = async (id: string) => {
    if (!confirm('Bu kampanya kalıcı olarak silinecek. Emin misiniz?')) return;
    await dbService.deleteCampaignPermanently(id);
    fetchHidden();
    onRefresh();
  };

  if (isLoading) return <div className="text-center py-20 text-slate-500">Çöp kutusu yükleniyor...</div>;

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <section>
        <h1 className="text-5xl font-bold font-display text-white mb-4 tracking-tight">Çöp Kutusu</h1>
        <p className="text-slate-500">Gizlenmiş kayıtlar ve kampanyalar burada tutulur.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Hidden Logs */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white font-display flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </span>
            Gizli Günlük Raporlar
          </h3>
          {deletedLogs.length === 0 ? (
            <p className="text-slate-600 italic">Gizli rapor bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {deletedLogs.map(log => (
                <div key={log.id} className="glass p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.userName} • {log.date}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleRestoreLog(log.id)} className="text-[10px] font-bold text-violet-400 hover:text-white transition-colors">Geri Yükle</button>
                      <button onClick={() => handlePermanentDeleteLog(log.id)} className="text-[10px] font-bold text-red-500/70 hover:text-red-500 transition-colors">Kalıcı Sil</button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2">{log.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hidden Campaigns */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white font-display flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
            </span>
            Gizli Kampanyalar
          </h3>
          {deletedCampaigns.length === 0 ? (
            <p className="text-slate-600 italic">Gizli kampanya bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {deletedCampaigns.map(c => (
                <div key={c.id} className="glass p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.brandName} • {c.campaignName}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleRestoreCampaign(c.id)} className="text-[10px] font-bold text-violet-400 hover:text-white transition-colors">Geri Yükle</button>
                      <button onClick={() => handlePermanentDeleteCampaign(c.id)} className="text-[10px] font-bold text-red-500/70 hover:text-red-500 transition-colors">Kalıcı Sil</button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">Başlangıç: {c.startDate.replace('T', ' ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecycleBin;
