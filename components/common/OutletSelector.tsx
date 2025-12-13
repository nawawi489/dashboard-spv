import React, { useState, useEffect } from 'react';
import { getTodayDateJakarta } from '../../utils/date';
import { OUTLETS } from '../../constants';
import Footer from './Footer';
import { Store, ArrowRight } from 'lucide-react';

interface OutletSelectorProps {
  onStart: (outlet: string, date: string) => void;
  initialOutlet?: string;
  initialDate?: string;
  onLogout?: () => void;
}

const OutletSelector: React.FC<OutletSelectorProps> = ({ onStart, initialOutlet = '', initialDate = '', onLogout }) => {
  const [outlet, setOutlet] = useState(initialOutlet);
  const [date] = useState(getTodayDateJakarta());

  useEffect(() => {
    if (initialOutlet) setOutlet(initialOutlet);
  }, [initialOutlet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outlet && date) {
      onStart(outlet, date);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="flex items-center justify-end">
          {onLogout && (
            <button onClick={onLogout} className="text-xs text-slate-500 hover:text-slate-800 underline">Logout</button>
          )}
        </div>
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 mb-4">
             <Store size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SPV Dashboard</h1>
          <p className="text-slate-500">Silahkan pilih outlet untuk mengakses dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 space-y-6 border border-slate-100">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Store size={16} className="text-blue-500" /> Pilih Outlet
            </label>
            <div className="relative">
              <select
                value={outlet}
                onChange={(e) => setOutlet(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="" disabled>-- Pilih Lokasi Outlet --</option>
                {OUTLETS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!outlet}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mulai Checklist <ArrowRight size={20} />
          </button>
        </form>

        <Footer />
      </div>
    </div>
  );
};

export default OutletSelector;
