import React, { useMemo, useState } from 'react';
import { CalendarRange, Send, Loader2, CheckCircle2 } from 'lucide-react';
import PhotoUpload from '@components/media/PhotoUpload';
import { submitDeposit, fetchCashSum } from '@services/deposit';
import { DepositSubmission } from '../../types';

interface DepositFormProps {
  outlet: string;
}

const DepositForm: React.FC<DepositFormProps> = ({ outlet }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cashLoading, setCashLoading] = useState(false);
  const [cashError, setCashError] = useState<string | null>(null);
  const [cashTotal, setCashTotal] = useState<number | null>(null);

  const rangeDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  }, [startDate, endDate]);

  const isRangeValid = useMemo(() => {
    if (!startDate || !endDate) return false;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) return false;
    return rangeDays >= 1 && rangeDays <= 7;
  }, [startDate, endDate, rangeDays]);

  React.useEffect(() => {
    setCashError(null);
    setCashTotal(null);
    if (!isRangeValid) return;
    if (!outlet || !startDate || !endDate) return;
    let cancelled = false;
    const run = async () => {
      setCashLoading(true);
      try {
        const total = await fetchCashSum(outlet, startDate, endDate);
        if (!cancelled) setCashTotal(total);
      } catch (e) {
        if (!cancelled) setCashError('Tidak dapat mengambil total tunai.');
      } finally {
        if (!cancelled) setCashLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [outlet, startDate, endDate, isRangeValid]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    if (!isRangeValid) {
      setErrorMsg('Rentang tanggal tidak valid (min 1 hari, max 7 hari).');
      return;
    }
    if (photos.length === 0) {
      setErrorMsg('Bukti transfer wajib diunggah.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhoto = photos[0].replace(/^data:image\/\w+;base64,/, '');
      let totalTunai = cashTotal;
      if (totalTunai == null) {
        try {
          totalTunai = await fetchCashSum(outlet, startDate, endDate);
        } catch {}
      }
      const payload: DepositSubmission = {
        outlet,
        tanggal_mulai: startDate,
        tanggal_selesai: endDate,
        bukti_base64: cleanPhoto,
        jumlah_tunai_periode: typeof totalTunai === 'number' ? totalTunai : undefined,
        catatan: notes || undefined,
        timestamp: new Date().toISOString()
      };
      setIsSuccess(true);
      await submitDeposit(payload);
      persistSubmissionMeta();
      setStartDate('');
      setEndDate('');
      setPhotos([]);
      setNotes('');
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      setIsSuccess(false);
      const msg = error instanceof Error ? error.message : 'Gagal mengirim bukti setoran. Coba lagi.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };


  const persistSubmissionMeta = () => {
    const key = 'deposit_submissions';
    try {
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.push({ outlet, startDate, endDate, timestamp: Date.now() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
  };


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      <div className="bg-green-600 px-4 py-3 flex items-center gap-2 text-white">
        <CalendarRange size={20} />
        <h3 className="font-bold text-sm">Input Bukti Setoran Outlet</h3>
      </div>

      <div className="p-4 space-y-4">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-green-600">
            <CheckCircle2 size={48} className="mb-2" />
            <p className="font-bold">Berhasil Terkirim</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Rentang: {rangeDays > 0 ? `${rangeDays} hari` : '-'}</p>
              <div className="mt-1 text-sm">
                {cashLoading && (
                  <span className="text-slate-500">Menghitung jumlah tunai...</span>
                )}
                {!cashLoading && cashError && (
                  <span className="text-red-600">{cashError}</span>
                )}
                {!cashLoading && cashError === null && cashTotal !== null && (
                  <span className="font-semibold text-slate-800">Jumlah tunai rentang ini: Rp {cashTotal.toLocaleString('id-ID')}</span>
                )}
              </div>
            </div>

            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              accept="image/png,image/jpeg"
              label="Bukti Transfer"
            />


            {errorMsg && (
              <div className="text-red-600 text-sm font-medium">{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  <span>Kirim</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default DepositForm;
