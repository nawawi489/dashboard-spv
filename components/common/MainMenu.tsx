import React from 'react';
import { ClipboardList, Banknote, ArrowLeft, PackageCheck, Boxes } from 'lucide-react';
import Footer from './Footer';

interface MainMenuProps {
  outlet: string;
  onSelectFeature: (feature: 'TASK' | 'DEPOSIT' | 'PO' | 'STOCK') => void;
  onBack: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ outlet, onSelectFeature, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Pilih Menu</h1>
        <p className="text-slate-500 mt-1">Outlet: <span className="font-semibold text-blue-600">{outlet}</span></p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto w-full">
        <button
          onClick={() => onSelectFeature('TASK')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all group text-left"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <ClipboardList size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Daily Task SPV</h3>
          <p className="text-slate-500 text-sm">
            Checklist tugas harian supervisor.
          </p>
        </button>

        <button
          onClick={() => onSelectFeature('DEPOSIT')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-green-200 transition-all group text-left"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
            <Banknote size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Input Bukti Setoran</h3>
          <p className="text-slate-500 text-sm">
            Upload bukti setoran tunai outlet sesuai rentang waktu.
          </p>
        </button>

        <button
          onClick={() => onSelectFeature('PO')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-purple-200 transition-all group text-left"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
            <PackageCheck size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi PO Masuk</h3>
          <p className="text-slate-500 text-sm">
            Verifikasi barang PO yang tiba di outlet.
          </p>
        </button>

        <button
          onClick={() => onSelectFeature('STOCK')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-orange-200 transition-all group text-left"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
            <Boxes size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Pemakaian Stok</h3>
          <p className="text-slate-500 text-sm">
            Laporan pemakaian stok harian outlet.
          </p>
        </button>
      </div>

      <div className="mt-auto pt-6">
        <Footer />
      </div>
    </div>
  );
};

export default MainMenu;
