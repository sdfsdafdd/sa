
import React, { useState } from 'react';
import { User, Campaign, CampaignStatus } from '../types';
import { dbService } from '../services/dbService';

interface CampaignsPanelProps {
  user: User;
  selectedDate: string;
  allCampaigns: Campaign[];
  onRefresh: () => Promise<void> | void;
}

const CampaignsPanel: React.FC<CampaignsPanelProps> = ({ user, selectedDate, allCampaigns, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    brandName: '',
    campaignName: '',
    notes: '',
    startDate: '',
    endDate: ''
  });

  const getStatus = (start: string, end: string): CampaignStatus => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now < startTime) return CampaignStatus.UPCOMING;
    if (now > endTime) return CampaignStatus.ENDED;
    return CampaignStatus.ACTIVE;
  };

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setFormData({ brandName: '', campaignName: '', notes: '', startDate: '', endDate: '' });
    setIsAdding(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      brandName: campaign.brandName,
      campaignName: campaign.campaignName,
      notes: campaign.notes,
      startDate: campaign.startDate,
      endDate: campaign.endDate
    });
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const campaignToSave: Campaign = {
        id: editingCampaign ? editingCampaign.id : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
        userId: user.id,
        userName: user.displayName,
        ...formData,
        createdAt: editingCampaign ? editingCampaign.createdAt : Date.now(),
        isDeleted: false,
      };
      await dbService.saveCampaign(campaignToSave);
      setIsAdding(false);
      setEditingCampaign(null);
      if (formData.startDate.split('T')[0] !== selectedDate) {
        setShowAllDates(true);
      }
      await onRefresh();
    } catch (error: any) {
      alert(`Hata: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // DOĞRU ÖRNEK: handleDelete (handleToTrash)
  const handleToTrash = async (id: string) => {
    if (!confirm("Bu kampanyayı çöp kutusuna taşımak istediğinize emin misiniz?")) return;
    
    setIsProcessing(true); // UI yükleniyor durumuna geçer
    try {
      // 1. Veritabanında (localStorage) silme işaretini koy
      await dbService.hideCampaign(id, user.id);
      
      // 2. Parent state'in (Dashboard) güncellenmesini bekle.
      // Dashboard.fetchData() asenkron olarak dbService'den güncel listeyi çekecek 
      // ve setCampaigns() ile listeyi güncelleyecektir.
      await onRefresh(); 
      
      console.log("Kampanya başarıyla gizlendi ve liste yenilendi.");
    } catch (error: any) {
      alert(`Silme işlemi başarısız: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAllToTrash = async () => {
    const activeCampaigns = allCampaigns.filter(c => !c.isDeleted);
    if (activeCampaigns.length === 0) return;

    if (!confirm(`Tüm (${activeCampaigns.length}) kampanyayı çöp kutusuna taşımak istediğinize emin misiniz?`)) return;

    setIsProcessing(true);
    try {
      await dbService.hideAllCampaigns();
      await onRefresh();
    } catch (error: any) {
      alert(`Hata: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // State'ten gelen listeyi isDeleted durumuna göre burada da filtreleyerek çift güvenlik sağlıyoruz.
  const filteredCampaigns = allCampaigns
    .filter(c => (showAllDates || c.startDate.split('T')[0] === selectedDate) && (c.isDeleted === false || c.isDeleted === undefined))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const hasAnyActive = allCampaigns.some(c => !c.isDeleted);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-bold font-display text-white mb-2 tracking-tight">Kampanyalar</h1>
          <div className="flex items-center gap-4">
            <p className="text-slate-500">
              {showAllDates ? 'Tüm zamanların kampanyaları' : `Seçili tarihte (${selectedDate}) başlayan kampanyalar`}
            </p>
            <button 
              onClick={() => setShowAllDates(!showAllDates)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                showAllDates 
                ? 'bg-violet-600/20 border-violet-500 text-violet-400' 
                : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
              }`}
            >
              {showAllDates ? 'Filtreye Dön' : 'Tümünü Göster'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {hasAnyActive && (
            <button
              onClick={handleAllToTrash}
              disabled={isProcessing}
              className="flex-1 md:flex-none border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Tümünü Çöpe At
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className="flex-1 md:flex-none bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-violet-900/20 flex items-center justify-center gap-2 group whitespace-nowrap"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Yeni Kampanya Ekle
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="glass w-full max-w-2xl rounded-3xl p-8 border border-white/10 shadow-2xl scale-in-center">
            <h3 className="text-2xl font-bold mb-6 font-display text-white">
              {editingCampaign ? 'Kampanyayı Düzenle' : 'Yeni Kampanya Tanımla'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Marka / Şirket Adı</label>
                <input
                  required
                  value={formData.brandName}
                  onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50"
                  placeholder="Marka Adı"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Kampanya Adı</label>
                <input
                  required
                  value={formData.campaignName}
                  onChange={e => setFormData({ ...formData, campaignName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50"
                  placeholder="Kampanya Başlığı"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notlar</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50"
                  placeholder="Operasyonel detaylar..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Başlangıç Tarih & Saat</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bitiş Tarih & Saat</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50"
                />
              </div>
              <div className="md:col-span-2 flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all font-bold text-slate-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition-all font-bold disabled:opacity-50"
                >
                  {isProcessing ? 'Kaydediliyor...' : (editingCampaign ? 'Değişiklikleri Kaydet' : 'Kampanyayı Başlat')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-8 py-4">Şirket / Marka</th>
                <th className="px-8 py-4">Kampanya</th>
                <th className="px-8 py-4">Süreç</th>
                <th className="px-8 py-4">Durum</th>
                <th className="px-8 py-4 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500 italic">
                    Görüntülenecek aktif kampanya bulunmuyor.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map(c => {
                  const status = getStatus(c.startDate, c.endDate);
                  const statusColors = {
                    [CampaignStatus.UPCOMING]: 'bg-yellow-900/20 text-yellow-500 border-yellow-500/30',
                    [CampaignStatus.ACTIVE]: 'bg-green-900/20 text-green-500 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]',
                    [CampaignStatus.ENDED]: 'bg-slate-900/20 text-slate-500 border-white/10'
                  };

                  return (
                    <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-white font-bold">{c.brandName}</p>
                        <p className="text-xs text-slate-500 font-medium">{c.userName}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-slate-300 font-semibold">{c.campaignName}</p>
                        {c.notes && <p className="text-[10px] text-slate-600 truncate max-w-[150px]">{c.notes}</p>}
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs space-y-1">
                          <p className="text-slate-400">Baş: <span className="text-slate-300">{new Date(c.startDate).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></p>
                          <p className="text-slate-400">Bit: <span className="text-slate-300">{new Date(c.endDate).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${statusColors[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {c.userId === user.id ? (
                          <div className="flex justify-end gap-3 lg:opacity-0 group-hover:opacity-100 transition-all duration-300">
                             <button
                              onClick={() => handleEdit(c)}
                              className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                              title="Düzenle"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                             {/* SILME BUTONU KULLANIMI */}
                             <button
                              onClick={() => handleToTrash(c.id)}
                              className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white/10 transition-all"
                              title="Çöpe At"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Salt Okunur</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPanel;
