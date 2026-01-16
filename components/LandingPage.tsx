
import React, { useState } from 'react';
import { User } from '../types';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sabit ID oluşturma: E-posta adresini base64 formatına çevirerek 
    // her giriş yapıldığında aynı ID'nin oluşmasını sağlıyoruz.
    const userId = btoa(email.toLowerCase()).replace(/=/g, '');
    
    const user: User = {
      id: userId,
      email: email.toLowerCase(),
      displayName: displayName || email.split('@')[0],
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a001a] to-[#1a0033] flex flex-col md:flex-row overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Side: Brand Story */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10">
        <h2 className="text-violet-500 font-bold tracking-widest uppercase mb-4 opacity-80 font-display">
          Essoftware
        </h2>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white font-display leading-tight">
          Profesyonel Reklam <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-600">
            Danışmanlığı.
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-xl mb-12 leading-relaxed">
          Ajanslar için günlük iş takibi ve kampanya kontrol paneli. Essoftware ekipleri için geliştirilen bu platform, tüm operasyonel süreci tek merkezden yönetmenizi sağlar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          {[
            { title: 'Günlük İş Kayıtları', desc: 'Şeffaf ve raporlanabilir' },
            { title: 'Ekip Görünürlüğü', desc: 'Senkronize çalışma disiplini' },
            { title: 'Kampanya Takibi', desc: 'Zamanında aksiyon, sıfır unutma' },
            { title: 'Güvenli Altyapı', desc: 'Verileriniz her zaman güvende' }
          ].map((feat, i) => (
            <div key={i} className="glass p-4 rounded-xl">
              <h3 className="text-violet-400 font-semibold mb-1">{feat.title}</h3>
              <p className="text-sm text-slate-500">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Auth Panel */}
      <div className="w-full md:w-[450px] lg:w-[500px] flex items-center justify-center p-8 z-10">
        <div className="w-full glass p-10 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2 text-white font-display">
              {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'}
            </h2>
            <p className="text-slate-500 mb-8">
              Essoftware ekipleri için güvenli erişim.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600 transition-all"
                    placeholder="Adınız ve Soyadınız"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">E-posta</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600 transition-all"
                  placeholder="name@essoftware.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Şifre</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-violet-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-slate-400 hover:text-violet-400 transition-colors text-sm"
              >
                {isRegister ? 'Zaten bir hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt Ol'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
