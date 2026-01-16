
import React, { useState, useEffect } from 'react';
import { User, LogEntry, WorkTag } from '../types';
import { dbService } from '../services/dbService';
import { geminiService } from '../services/geminiService';

interface DailyLogsProps {
  user: User;
  selectedDate: string;
  allLogs: LogEntry[];
  onRefresh: () => Promise<void> | void;
}

const DailyLogs: React.FC<DailyLogsProps> = ({ user, selectedDate, allLogs, onRefresh }) => {
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<WorkTag>(WorkTag.ADVERTISING);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [deepAnalysis, setDeepAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const logsForDate = allLogs
    .filter(log => log.date === selectedDate)
    .sort((a, b) => b.createdAt - a.createdAt);

  useEffect(() => {
    const fetchSummary = async () => {
      if (logsForDate.length > 0) {
        setIsSummarizing(true);
        const text = await geminiService.getDailySummary(logsForDate, selectedDate);
        setSummary(text);
        setIsSummarizing(false);
      } else {
        setSummary('');
      }
    };
    fetchSummary();
  }, [selectedDate, allLogs.length]);

  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const campaigns = await dbService.getCampaigns();
      const analysis = await geminiService.getDeepAnalysis(allLogs, campaigns);
      setDeepAnalysis(analysis);
    } catch (e) {
      setDeepAnalysis("Analiz sırasında bir hata oluştu.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const entryToSave: LogEntry = {
        id: editingLog ? editingLog.id : Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.displayName,
        date: selectedDate,
        content: content.trim(),
        tag,
        createdAt: editingLog ? editingLog.createdAt : Date.now(),
        isDeleted: false,
      };

      await dbService.saveLog(entryToSave);
      resetForm();
      await onRefresh();
    } catch (error: any) {
      alert(error.message || "Kayıt işlenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setTag(WorkTag.ADVERTISING);
    setEditingLog(null);
  };

  const handleEdit = (log: LogEntry) => {
    setEditingLog(log);
    setContent(log.content);
    setTag(log.tag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToTrash = async (id: string) => {
    if (!confirm('Bu raporu çöp kutusuna taşımak istediğinize emin misiniz?')) return;
    try {
      await dbService.hideLog(id, user.id);
      if (editingLog?.id === id) resetForm();
      await onRefresh();
    } catch (error: any) {
      alert(`Hata: ${error.message}`);
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <section className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black font-display text-white tracking-tight leading-none">
            Günlük Faaliyet <br />
            <span className="text-violet-500">Raporları</span>
          </h1>
          <div className="flex items-center gap-3 text-slate-400 font-medium text-lg md:text-xl">
            <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 00-2 2z" />
            </svg>
            {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="flex flex-col gap-4 items-start xl:items-end">
          {summary && (
            <div className="max-w-md glass p-5 rounded-2xl relative overflow-hidden shadow-2xl border-l-4 border-l-violet-600 bg-white/[0.02]">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
                 <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">AI Özet Analizi</p>
               </div>
               <p className="text-sm md:text-base text-slate-300 italic leading-relaxed font-medium">
                 {isSummarizing ? 'Zeka katmanları yükleniyor...' : summary}
               </p>
            </div>
          )}
          <button 
            onClick={handleDeepAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600/10 border border-violet-500/20 rounded-full text-[11px] font-bold uppercase tracking-widest text-violet-400 hover:text-white hover:bg-violet-600/20 transition-all disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {isAnalyzing ? 'Derinlikler Analiz Ediliyor...' : 'Yapay Zeka Derin Analiz'}
          </button>
        </div>
      </section>

      {deepAnalysis && (
        <div className="glass p-10 rounded-[2.5rem] border border-violet-500/20 shadow-2xl animate-in slide-in-from-top-6 duration-700 bg-gradient-to-br from-violet-900/5 to-transparent">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-2xl font-bold font-display text-white flex items-center gap-4">
              <span className="p-3 bg-violet-600 rounded-2xl shadow-lg shadow-violet-900/40"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.674a1 1 0 00.922-.617l2.108-4.742A1 1 0 0016.446 10h-2.108l.892-4.462A1 1 0 0014.246 4h-4.674a1 1 0 00-.922.617l-2.108 4.742A1 1 0 007.554 11h2.108l-.892 4.462A1 1 0 009.663 17z" /></svg></span>
              Stratejik Ajans Analizi
            </h3>
            <button onClick={() => setDeepAnalysis('')} className="p-2 text-slate-600 hover:text-white transition-colors bg-white/5 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-slate-300 leading-loose whitespace-pre-wrap text-base md:text-lg">{deepAnalysis}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className={`lg:col-span-1 glass p-10 rounded-[2rem] sticky top-24 border-t-8 transition-all duration-700 ${editingLog ? 'border-violet-600 shadow-[0_20px_50px_rgba(124,58,237,0.15)]' : 'border-transparent'}`}>
          <h3 className="text-xl font-bold mb-8 text-white font-display flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${editingLog ? 'bg-violet-500 animate-pulse' : 'bg-slate-700'}`}></div>
            {editingLog ? 'Kaydı Düzenle' : 'Yeni Kayıt Oluştur'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Çalışma Alanı</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(WorkTag).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${
                      tag === t 
                        ? 'bg-violet-600 border-violet-500 text-white shadow-xl shadow-violet-900/30' 
                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">İçerik Detayı</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50 placeholder:text-slate-700 text-base leading-relaxed"
                placeholder="Bugün hangi projeler üzerinde çalıştınız?..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-white text-black font-black text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'İşleniyor...' : (editingLog ? 'Güncelle' : 'Kaydı Yayınla')}
              </button>
              {editingLog && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 bg-white/5 text-slate-500 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm"
                >
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white font-display">Günlük Faaliyet Listesi</h3>
            <div className="h-px flex-1 mx-6 bg-white/5"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{logsForDate.length} Kayıt</span>
          </div>

          {logsForDate.length === 0 ? (
            <div className="glass p-20 rounded-[2.5rem] text-center border-dashed border-white/10">
              <svg className="w-16 h-16 text-slate-800 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-slate-500 italic text-lg">Bu tarih için henüz bir kayıt girilmemiş.</p>
            </div>
          ) : (
            logsForDate.map(log => (
              <div key={log.id} className="glass p-8 rounded-3xl group relative border border-white/5 hover:border-violet-500/20 transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] bg-gradient-to-r hover:from-white/[0.02] to-transparent">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-violet-600/10 flex items-center justify-center text-sm font-black text-violet-500 border border-violet-500/20">
                      {log.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">{log.userName}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          {log.tag}
                        </span>
                        <span className="text-[9px] font-medium text-slate-700">
                          {new Date(log.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {log.userId === user.id && (
                    <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleEdit(log)}
                        className="p-2.5 text-slate-600 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        title="Düzenle"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToTrash(log.id)}
                        className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-white/5 rounded-xl transition-all"
                        title="Çöpe At"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-slate-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-normal selection:bg-violet-600/30">
                  {log.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyLogs;
