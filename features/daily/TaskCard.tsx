import React, { useState } from 'react';
import { TaskData, TaskSubmission, getTaskId } from '@types';
import { submitTask } from '@services/tasks';
import PhotoUpload from '@components/media/PhotoUpload';
import { MIN_PHOTOS } from '@constants';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';

  interface TaskCardProps {
    task: TaskData;
    outlet: string;
    date: string;
    isCompleted: boolean;
    onComplete: (taskId: string) => void;
    onFail: (taskId: string) => void;
    coordinates: { lat: number | null; lng: number | null };
  }

const TaskCard: React.FC<TaskCardProps> = ({ task, outlet, date, isCompleted, onComplete, onFail, coordinates }) => {
  const [expanded, setExpanded] = useState(!isCompleted);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskId = getTaskId(task);

  const categoryRaw = task.Kategoriugas || task.KategoriTugas || 'Checklist';
  const taskTitle = task.Tugas || 'Tugas Tanpa Nama';
  const taskAction = task.Tindakan || ''; 
  const categoryLabel = String(categoryRaw).toUpperCase();

  const handleSubmit = async () => {
    if (photos.length < MIN_PHOTOS) {
      setError(`Wajib upload minimal ${MIN_PHOTOS} foto.`);
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const cleanPhotos = photos.map(photo => photo.replace(/^data:image\/\w+;base64,/, ''));

    const payload: TaskSubmission = {
      outlet,
      tanggal: date, 
      kategori: String(categoryRaw),
      tugas: String(taskTitle),
      foto_base64: cleanPhotos,
      catatan: notes,
      timestamp: new Date().toISOString(),
      latitude: coordinates.lat,
      longitude: coordinates.lng
    };

    try {
      onComplete(taskId);
      setExpanded(false);
      await submitTask(payload);
    } catch (err: any) {
      onFail(taskId);
      setError(err.message || "Gagal submit. Periksa koneksi internet.");
      setExpanded(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  if (isCompleted && !expanded) {
    return (
      <div 
        onClick={toggleExpand}
        className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 text-green-500">
            <CheckCircle2 size={24} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate line-through decoration-slate-400">{taskTitle}</p>
            <p className="text-xs text-slate-500">{categoryLabel}</p>
          </div>
        </div>
        <ChevronDown size={20} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${isCompleted ? 'border-green-100' : 'border-slate-200'} overflow-hidden transition-all duration-300`}>
      <div 
        onClick={toggleExpand}
        className="p-4 flex items-start justify-between cursor-pointer bg-white"
      >
        <div className="flex-1 mr-2">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-blue-50 text-blue-600 mb-1">
              {categoryLabel}
            </span>
            <h3 className="font-bold text-slate-800 leading-snug">{taskTitle}</h3>
            {taskAction && (
               <p className="text-sm text-slate-500 mt-1">{taskAction}</p>
            )}
        </div>
        <div className="pt-1">
           {expanded ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-4">
          <div className="h-px bg-slate-100 mb-2" />
          
          <PhotoUpload photos={photos} onPhotosChange={setPhotos} disabled={isCompleted || isSubmitting} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Catatan (Opsional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isCompleted || isSubmitting}
              placeholder="Tambahkan keterangan jika ada..."
              className="w-full text-sm p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-slate-50 min-h-[80px]"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg break-words">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isCompleted && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || photos.length < MIN_PHOTOS}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-md active:scale-[0.98]
                ${photos.length < MIN_PHOTOS 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                }
                ${isSubmitting ? 'opacity-80 cursor-wait' : ''}
              `}
            >
              {isSubmitting ? (
                <>Loading...</>
              ) : (
                <>
                  <Send size={18} />
                  Kirim Laporan
                </>
              )}
            </button>
          )}

          {isCompleted && (
            <div className="bg-green-50 text-green-700 text-center py-2 rounded-lg text-sm font-medium border border-green-100">
              Laporan Terkirim
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
