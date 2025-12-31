import React, { useState, FormEvent } from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { POItem } from '@types';
import FileUpload from './FileUpload';

interface POConfirmModalProps {
  item: POItem;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { jumlahDiterima: number; satuan: string; nomorInvoice: string; notaFile: File | null; barangFile: File | null; produkFree?: number; produkFreeUnit?: string; }) => void;
}

const POConfirmModal: React.FC<POConfirmModalProps> = ({ item, open, onClose, onSubmit }) => {
  const [jumlahDiterima, setJumlahDiterima] = useState<string>(String(item.jumlah_po));
  const [notaFile, setNotaFile] = useState<File | null>(null);
  const [barangFile, setBarangFile] = useState<File | null>(null);
  const [satuan, setSatuan] = useState<string>(item.satuan || '');
  const [nomorInvoice, setNomorInvoice] = useState<string>('');
  const [produkFree, setProdukFree] = useState<string>('');
  const [produkFreeUnit, setProdukFreeUnit] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!jumlahDiterima || parseInt(jumlahDiterima) < 0) { setError('Jumlah diterima tidak valid.'); return; }
    if (produkFree && parseInt(produkFree) < 0) { setError('Produk free tidak boleh negatif.'); return; }
    if (!satuan || !satuan.trim()) { setError('Satuan barang wajib diisi.'); return; }
    if (!nomorInvoice || !nomorInvoice.trim()) { setError('Nomor invoice wajib diisi.'); return; }
    if (!notaFile) { setError('Foto Nota wajib diupload.'); return; }
    if (!barangFile) { setError('Foto Barang wajib diupload.'); return; }
    setIsSubmitting(true);
    try {
      await onSubmit({ jumlahDiterima: parseInt(jumlahDiterima), satuan, nomorInvoice, notaFile, barangFile, produkFree: produkFree ? parseInt(produkFree) : 0, produkFreeUnit: produkFreeUnit || undefined });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Konfirmasi Barang</h2>
            <p className="text-sm text-gray-500">ID: {item.id_transaksi}</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Nama Barang</p>
              <p className="font-medium text-gray-900">{item.nama_barang}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Supplier</p>
              <p className="font-medium text-gray-900">{item.supplier}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Jumlah PO</p>
              <p className="font-medium text-gray-900">{item.jumlah_po}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Outlet</p>
              <p className="font-medium text-gray-900">{item.outlet}</p>
            </div>
          </div>

          <form id="confirmForm" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Real Diterima <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={jumlahDiterima} onChange={(e) => setJumlahDiterima(e.target.value)} className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produk Free (opsional)</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  value={produkFree}
                  onChange={(e) => setProdukFree(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="input produk free jika ada"
                />
                <select
                  value={produkFreeUnit}
                  onChange={(e) => setProdukFreeUnit(e.target.value)}
                  className="px-3 h-[42px] bg-white text-gray-900 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Satuan</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Pack">Pack</option>
                  <option value="Kg">Kg</option>
                  <option value="Liter">Liter</option>
                  <option value="Zak">Zak</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Satuan Barang <span className="text-red-500">*</span></label>
              <input type="text" value={satuan} onChange={(e) => setSatuan(e.target.value)} className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Contoh: Karton, Pcs" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Invoice <span className="text-red-500">*</span></label>
              <input type="text" value={nomorInvoice} onChange={(e) => setNomorInvoice(e.target.value)} className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Contoh: INV-2025-001" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload label="Foto Nota" onFileSelect={setNotaFile} required />
              <FileUpload label="Foto Barang" onFileSelect={setBarangFile} required />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 animate-pulse">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3 sticky bottom-0 z-10">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all" disabled={isSubmitting}>Batal</button>
          <button type="submit" form="confirmForm" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Mengirim...</>) : (<><CheckCircle className="w-4 h-4" />Kirim Konfirmasi</>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POConfirmModal;
