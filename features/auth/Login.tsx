import React, { useState } from 'react';
import { Lock, User, LogIn, Eye, EyeOff } from 'lucide-react';
import Footer from '../../components/common/Footer';

interface LoginProps {
  onLogin: (user: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user.trim()) {
      setError('Nama wajib diisi');
      return;
    }
    const envUser = (import.meta as any).env?.VITE_LOGIN_USER;
    const envPass = (import.meta as any).env?.VITE_LOGIN_PASS;
    if (!envUser || !envPass) {
      setError('Konfigurasi login belum diatur');
      return;
    }
    const u = user.trim();
    const p = password.trim();
    const expectedUser = String(envUser).trim().toLowerCase();
    const expectedPass = String(envPass).trim();
    if (u.toLowerCase() !== expectedUser || p !== expectedPass) {
      setError('Username atau password salah');
      return;
    }
    onLogin(u);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 mb-4">
             <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SPV DASHBOARD</h1>
          <p className="text-slate-500">Masuk untuk melanjutkan.</p>
        </div>

        <form onSubmit={submit} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 space-y-6 border border-slate-100">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-blue-500" /> Username
            </label>
            <input 
              type="text" 
              value={user} 
              onChange={(e) => setUser(e.target.value)} 
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Masukkan Username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Lock size={16} className="text-blue-500" /> Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          <button
            type="submit"
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <LogIn size={20} /> Masuk
          </button>
        </form>

        <Footer />
      </div>
    </div>
  );
};

export default Login;
