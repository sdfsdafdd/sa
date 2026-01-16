
import React, { useState, useEffect, useCallback } from 'react';
import { User, LogEntry, Campaign } from '../types';
import { dbService } from '../services/dbService';
import Calendar from './Calendar';
import DailyLogs from './DailyLogs';
import CampaignsPanel from './CampaignsPanel';
import RecycleBin from './RecycleBin';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'campaigns' | 'bin'>('logs');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const [fetchedLogs, fetchedCampaigns] = await Promise.all([
        dbService.getLogs(),
        dbService.getCampaigns()
      ]);
      setLogs([...fetchedLogs]);
      setCampaigns([...fetchedCampaigns]);
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const logDates = logs.map(log => log.date);
  const campaignStartDates = campaigns.map(c => c.startDate.split('T')[0]);
  const datesWithActivity = Array.from(new Set([...logDates, ...campaignStartDates]));

  return (
    <div className="min-h-screen bg-[#020205] flex">
      {/* Sidebar */}
      <aside className="w-80 bg-[#08080c] border-r border-white/5 flex flex-col hidden lg:flex">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-xl font-bold font-display text-white tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-600"></span>
            ESSOFTWARE
          </h2>
        </div>

        <div className="p-6">
          <Calendar 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
            activeDates={datesWithActivity}
          />
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="p-4 glass rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-lg">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:text-red-500 transition-colors"
              title="Çıkış Yap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {isRefreshing && (
          <div className="absolute top-0 left-0 w-full h-1 bg-transparent overflow-hidden z-50">
            <div className="h-full bg-violet-600 animate-progress origin-left"></div>
          </div>
        )}

        {/* Header with Tabs */}
        <header className="h-20 border-b border-white/5 flex items-center px-8 bg-[#020205]/50 backdrop-blur-xl sticky top-0 z-40 overflow-x-auto">
          <div className="flex gap-10 min-w-max">
            <button
              onClick={() => setActiveTab('logs')}
              className={`relative h-20 flex items-center text-xs font-bold tracking-[0.2em] uppercase transition-all ${
                activeTab === 'logs' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Günlük Raporlar
              {activeTab === 'logs' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.5)]"></span>}
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`relative h-20 flex items-center text-xs font-bold tracking-[0.2em] uppercase transition-all ${
                activeTab === 'campaigns' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Kampanyalar
              {activeTab === 'campaigns' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.5)]"></span>}
            </button>
            <button
              onClick={() => setActiveTab('bin')}
              className={`relative h-20 flex items-center text-xs font-bold tracking-[0.2em] uppercase transition-all ${
                activeTab === 'bin' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Çöp Kutusu
              {activeTab === 'bin' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.5)]"></span>}
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activeTab === 'logs' ? (
            <DailyLogs 
              user={user} 
              selectedDate={selectedDate} 
              allLogs={logs} 
              onRefresh={() => fetchData(false)} 
            />
          ) : activeTab === 'campaigns' ? (
            <CampaignsPanel 
              user={user} 
              selectedDate={selectedDate}
              allCampaigns={campaigns} 
              onRefresh={() => fetchData(false)} 
            />
          ) : (
            <RecycleBin 
              user={user}
              onRefresh={() => fetchData(false)}
            />
          )}
        </div>
      </main>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.5); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 1s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
