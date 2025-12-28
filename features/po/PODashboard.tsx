import React, { useEffect, useMemo, useState } from 'react';
import { PackageCheck, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { fetchPOList, confirmPO } from '@services/po';
import { POItem, ConfirmData } from '@types';
import Footer from '@components/common/Footer';
import POCard from './POCard';
import POConfirmModal from './POConfirmModal';
import { getTodayDateJakarta } from '@utils/date';

interface PODashboardProps {
  outlet: string;
  onBack: () => void;
}

const PODashboard: React.FC<PODashboardProps> = ({ outlet, onBack }) => {
  const [list, setList] = useState<POItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<POItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 6;
  const [notaFile, setNotaFile] = useState<File | null>(null);
  const [barangFile, setBarangFile] = useState<File | null>(null);
  const [jumlahDiterima, setJumlahDiterima] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]); // Track locally confirmed items

  const reloadPO = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPOList();
      const filtered = data.filter(item => String(item.outlet).trim().toLowerCase() === String(outlet).trim().toLowerCase());
      setList(filtered);
      // Reset confirmed list on reload since data is fresh
      setConfirmedIds([]);
      setCurrentPage(1);
      setActive(null);
    } catch (e) {
      setError('Gagal memuat data PO masuk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadPO();
  }, [outlet]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(list.length / PAGE_SIZE)), [list.length]);
  const startIndex = useMemo(() => (currentPage - 1) * PAGE_SIZE, [currentPage]);
  const paginatedList = useMemo(() => list.slice(startIndex, startIndex + PAGE_SIZE), [list, startIndex]);

  const startConfirm = (item: POItem) => {
    setActive(item);
    setNotaFile(null);
    setBarangFile(null);
    setJumlahDiterima(0);
  };

  const submitConfirm = async (data: { jumlahDiterima: number; satuan: string; nomorInvoice: string; notaFile: File | null; barangFile: File | null; produkFree?: number; produkFreeUnit?: string; }) => {
    if (!active) return;
    if (!active.id_barang || !String(active.id_barang).trim()) { setError('ID BARANG wajib ada'); return; }
    if (!data.satuan || !String(data.satuan).trim()) { setError('Satuan barang wajib diisi'); return; }
    if (!data.nomorInvoice || !String(data.nomorInvoice).trim()) { setError('Nomor invoice wajib diisi'); return; }
    if (!data.notaFile) { setError('Foto nota wajib diupload'); return; }
    if (!data.barangFile) { setError('Foto barang wajib diupload'); return; }
    const jd = data.jumlahDiterima;
    if (isNaN(jd) || jd <= 0) { setError('Jumlah diterima tidak valid'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const payload: ConfirmData = {
        id_transaksi: active.id_transaksi,
        id_barang: active.id_barang,
        nama_barang: active.nama_barang,
        jumlah_po: active.jumlah_po,
        jumlah_diterima: jd,
        satuan: data.satuan,
        supplier: active.supplier,
        outlet,
        foto_nota: data.notaFile,
        foto_barang: data.barangFile,
        nomor_invoice: data.nomorInvoice,
        produk_free: data.produkFree ?? 0,
        produk_free_satuan: data.produkFreeUnit,
        tanggal_konfirmasi: getTodayDateJakarta(),
      };
      await confirmPO(payload);
      
      // Mark as confirmed locally
      setConfirmedIds(prev => [...prev, active.id_transaksi]);
      
      setActive(null);
      // Optional: Don't immediately reload to show the "Terkonfirmasi" state
      // const refreshed = await fetchPOList();
      // setList(refreshed.filter(item => String(item.outlet).trim().toLowerCase() === String(outlet).trim().toLowerCase()));
    } catch (e) {
      setError('Gagal mengirim konfirmasi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between gap-3">
           <button type="button" onClick={onBack} className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors" aria-label="Kembali">
             <ArrowLeft size={20} onClick={onBack} />
           </button>
           <div className="flex-1">
             <h1 className="font-bold text-slate-800 text-lg">Konfirmasi PO Masuk</h1>
             <div className="text-xs text-slate-500">{outlet}</div>
           </div>
          <button onClick={reloadPO} aria-label="Reload Data" className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>Tutup</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-500">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                <PackageCheck size={32} className="opacity-50" />
                <p>Tidak ada PO menunggu konfirmasi.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedList.map((item, idx) => (
                    <POCard 
                      key={`${item.id_transaksi}-${item.id_barang ?? idx}`} 
                      data={item} 
                      onConfirm={startConfirm}
                      isConfirmed={confirmedIds.includes(item.id_transaksi)}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-slate-500">
                    Menampilkan {list.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, list.length)} dari {list.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-slate-600">Halaman {currentPage} / {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {active && (
                  <POConfirmModal
                    item={active}
                    open={!!active}
                    onClose={() => setActive(null)}
                    onSubmit={submitConfirm}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PODashboard;
