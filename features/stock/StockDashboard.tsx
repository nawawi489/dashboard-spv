import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Search, Save, Loader2, CheckCircle2, Calendar, Minus, Plus } from 'lucide-react';
import Footer from '../../components/common/Footer';
import { fetchStockItems, submitStockUsage, submitStockOpname } from '../../services/stock';
import { StockItem } from '../../types';
import { getTodayDateJakarta } from '../../utils/date';

interface StockDashboardProps {
  outlet: string;
  onBack: () => void;
  title?: string;
  mode?: 'USAGE' | 'OPNAME';
}

interface UsageInput {
  [itemId: string]: {
    quantity: string; // Keep as string to handle empty/decimal inputs easily
    note: string;
  }
}

const PAGE_SIZE = 20;

const StockDashboard: React.FC<StockDashboardProps> = ({ outlet, onBack, title, mode = 'USAGE' }) => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [usage, setUsage] = useState<UsageInput>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateJakarta());
  const [currentPage, setCurrentPage] = useState(1);
  const [draftSaved, setDraftSaved] = useState(false);

  // Draft Key based on mode and outlet
  const draftKey = `draft_stock_${mode.toLowerCase()}_${outlet}`;

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setUsage(parsed);
        }
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, [draftKey]);

  // Save draft function
  const saveDraft = () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(usage));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch (e) {
      alert("Gagal menyimpan draft (penyimpanan penuh?)");
    }
  };

  // Calculate date limits (today and 7 days ago)
  const dateLimits = useMemo(() => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 7);
    
    // Format to YYYY-MM-DD for input min/max
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return {
      max: formatDate(today),
      min: formatDate(minDate)
    };
  }, []);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchStockItems();
      setItems(data);
    } catch (e) {
      setError('Gagal memuat data barang.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const lower = filter.toLowerCase();
    return items.filter(item => 
      item.nama_barang.toLowerCase().includes(lower) || 
      item.kategori?.toLowerCase().includes(lower)
    );
  }, [items, filter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handleUsageChange = (itemId: string, field: 'quantity' | 'note', value: string) => {
    if (field === 'quantity') {
      const numVal = parseFloat(value);
      if (value !== '' && (isNaN(numVal) || numVal < 0)) return;
    }
    
    setUsage(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: field === 'quantity' ? value : (prev[itemId]?.quantity || ''),
        note: field === 'note' ? value : (prev[itemId]?.note || '')
      }
    }));
  };

  const adjustQuantity = (itemId: string, delta: number) => {
    setUsage(prev => {
      const currentQty = parseFloat(prev[itemId]?.quantity || '0');
      const newQty = Math.max(0, currentQty + delta);
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          quantity: newQty > 0 ? String(newQty) : '',
          note: prev[itemId]?.note || ''
        }
      };
    });
  };

  const getFilledItems = () => {
    return Object.entries(usage)
      .filter(([_, val]) => val.quantity && parseFloat(val.quantity) > 0)
      .map(([id, val]) => {
        const item = items.find(i => i.id === id);
        return {
          id_barang: id,
          nama_barang: item?.nama_barang || 'Unknown',
          jumlah_pakai: parseFloat(val.quantity),
          satuan: item?.satuan || '',
          keterangan: val.note
        };
      });
  };

  const handleSubmit = () => {
    const filledItems = getFilledItems();

    if (filledItems.length === 0) {
      alert('Belum ada pemakaian stok yang diisi.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    const filledItems = getFilledItems();

    const payload = filledItems.map(item => ({
      ...item,
      outlet,
      tanggal: selectedDate,
      timestamp: new Date().toISOString()
    }));

    try {
      if (mode === 'OPNAME') {
        await submitStockOpname(payload);
      } else {
        await submitStockUsage(payload);
      }
      setSuccess(true);
      
      // Clear draft on success
      localStorage.removeItem(draftKey);

      setTimeout(() => {
        setSuccess(false);
        setUsage({});
        // Optional: onBack();
      }, 2000);
    } catch (e) {
      alert('Gagal menyimpan laporan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p>Memuat data barang...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between gap-3">
           <button type="button" onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors" aria-label="Kembali">
             <ArrowLeft size={20} />
           </button>
           <div className="flex-1">
             <h1 className="font-bold text-slate-800 text-lg">{title ?? 'Pemakaian Stok'}</h1>
             <div className="text-xs text-slate-500">{outlet}</div>
           </div>
           <div className="w-10" /> {/* Spacer */}
        </div>
        
        {/* Date & Search */}
        <div className="px-4 pb-3 max-w-md mx-auto space-y-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <Calendar size={18} className="text-slate-500 ml-2" />
            <input 
              type="date"
              value={selectedDate}
              min={dateLimits.min}
              max={dateLimits.max}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-sm text-slate-700 font-medium focus:ring-0 w-full"
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama barang..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-3 pb-32">
        {draftSaved && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 animate-fade-in-down">
            Draft tersimpan
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm text-center">
            {error}
            <button onClick={loadItems} className="block mx-auto mt-2 text-blue-600 font-semibold underline">Coba Lagi</button>
          </div>
        )}

        {filteredItems.length === 0 && !loading && !error && (
          <div className="text-center py-10 text-slate-500">
            Barang tidak ditemukan.
          </div>
        )}

        {paginatedItems.map(item => {
          const val = usage[item.id] || { quantity: '', note: '' };
          const hasValue = val.quantity && parseFloat(val.quantity) > 0;
          
          return (
            <div 
              key={item.id} 
              className={`bg-white p-4 rounded-xl border transition-all ${
                hasValue ? 'border-blue-300 shadow-md shadow-blue-50' : 'border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="text-center">
                  <h3 className="font-semibold text-slate-800 mb-1">{item.nama_barang}</h3>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md whitespace-nowrap inline-block">
                    {item.satuan}
                  </span>
                </div>
              
                <div className="flex justify-center w-full">
                <div className="w-40 flex-shrink-0 flex items-center">
                  <button
                    onClick={() => adjustQuantity(item.id, -1)}
                    className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-l-lg border border-r-0 border-slate-200 hover:bg-slate-200 active:bg-slate-300 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    min="0"
                    value={val.quantity}
                    onChange={(e) => handleUsageChange(item.id, 'quantity', e.target.value)}
                    className={`w-full h-10 p-2 border-y text-center font-bold outline-none focus:ring-0 focus:z-10 ${
                      hasValue ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200'
                    }`}
                  />
                  <button
                    onClick={() => adjustQuantity(item.id, 1)}
                    className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-r-lg border border-l-0 border-slate-200 hover:bg-slate-200 active:bg-slate-300 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              </div>
            </div>
          );
        })}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-slate-600">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </main>

      {/* Floating Submit Button */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-lg z-20">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            onClick={saveDraft}
            className="bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            title="Simpan Sementara"
          >
            <Save size={20} />
            <span className="hidden sm:inline">Draft</span>
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98] transition-all"
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CheckCircle2 size={20} />
            )}
            Simpan Laporan
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Save size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi Simpan</h3>
              <p className="text-slate-600 mb-6">
                Anda akan menyimpan laporan pemakaian untuk <strong className="text-slate-900">{getFilledItems().length} barang</strong> pada tanggal <strong className="text-slate-900">{selectedDate}</strong>. Lanjutkan?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-colors"
                >
                  Ya, Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-50 duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Berhasil Disimpan!</h2>
            <p className="text-slate-500">Laporan pemakaian stok telah terkirim.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDashboard;
