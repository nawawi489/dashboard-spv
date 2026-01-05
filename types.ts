export interface TaskData {
  KategoriTugas?: string; // Matches n8n data
  Tugas: string;
  Tindakan: string;
  [key: string]: any;
}

export interface TaskSubmission {
  outlet: string;
  tanggal: string; // Required by n8n workflow
  kategori: string;
  tugas: string;
  foto_base64: string[];
  catatan: string;
  timestamp: string;
  latitude?: number | null;
  longitude?: number | null;
}

export enum AppView {
  LOGIN = 'LOGIN',
  SELECT_OUTLET = 'SELECT_OUTLET',
  SELECT_FEATURE = 'SELECT_FEATURE',
  CHECKLIST = 'CHECKLIST',
  DEPOSIT = 'DEPOSIT',
  PO = 'PO',
  STOCK = 'STOCK',
  SUCCESS = 'SUCCESS'
}

export interface AppState {
  view: AppView;
  selectedOutlet: string;
  selectedDate: string;
  tasks: TaskData[];
  completedTasks: string[]; // Array of unique IDs (e.g., category + task name)
  user?: string;
  loginAt?: number;
}

// Helper to generate a unique ID for a task since the API might not provide one
export const getTaskId = (task: TaskData): string => {
  // Handle the specific keys from n8n (Kategoriugas) with fallbacks
  const cat = task.Kategoriugas || task.KategoriTugas || 'general';
  const name = task.Tugas || 'task-' + Math.random().toString(36).substring(7);
  return `${cat}-${name}`.replace(/\s+/g, '-').toLowerCase();
};

export interface DepositSubmission {
  outlet: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  bukti_base64: string;
  jumlah_tunai_periode?: number;
  catatan?: string;
  timestamp: string;
}

export interface POItem {
  id_transaksi: string;
  nama_barang: string;
  outlet: string;
  jumlah_po: number;
  harga_satuan: number;
  total_harga: number;
  supplier: string;
  id_barang?: string;
  satuan?: string;
  tanggal?: string;
}

export interface ConfirmData {
  id_transaksi: string;
  id_barang: string;
  nama_barang: string;
  jumlah_po: number;
  jumlah_diterima: number;
  satuan: string;
  supplier: string;
  outlet: string;
  foto_nota: File | null;
  foto_barang: File | null;
  nomor_invoice: string;
  keterangan_spv?: string;
  produk_free?: number;
  produk_free_satuan?: string;
  tanggal_konfirmasi: string;
}

export interface StockItem {
  id: string;
  nama_barang: string;
  satuan: string;
  kategori?: string;
}

export interface StockUsageItemSubmission {
  outlet: string;
  tanggal: string;
  id_barang: string;
  nama_barang: string;
  jumlah_pakai: number;
  satuan: string;
  keterangan?: string;
  timestamp: string;
}

export type StockUsageSubmission = StockUsageItemSubmission[];
