const env = (import.meta as any).env || {};
// Fallback to the known URL if environment variable is missing (prevents crash on Vercel)
const base = env.VITE_API_BASE_URL || 'https://n8n.srv1123014.hstgr.cloud';

if (!env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL tidak ditemukan, menggunakan default URL.');
}

export const API_BASE_URL = base;

export const ENDPOINTS = {
  GET_TASKS: `${API_BASE_URL}/webhook/get-task-spv`,
  SUBMIT_TASK: `${API_BASE_URL}/webhook/submit-checklist`,
  SUBMIT_DEPOSIT: `${API_BASE_URL}/webhook/submit-setoran-outlet`,
  GET_CASH_SUM: `${API_BASE_URL}/webhook/setoran-tunai`,
  GET_PO_LIST: `${API_BASE_URL}/webhook/list-permintaan-po`,
  CONFIRM_PO: `${API_BASE_URL}/webhook/spv-konfirmasi-po-tiba`,
  GET_DB_BARANG: `${API_BASE_URL}/webhook/get-barang`,
  SUBMIT_STOCK_USAGE: `${API_BASE_URL}/webhook/submit-penggunaan-barang`,
  SUBMIT_STOCK_OPNAME: `${API_BASE_URL}/webhook/stok-opname`
};

export const OUTLETS = [
  "Pizza Nyantuy Sungai Poso",
  "Pizza Nyantuy Gowa",
  "Pizza Nyantuy Sudiang",
  "Pizza Nyantuy Barombong",
  "Pizza Nyantuy Limbung"
];

export const MAX_PHOTOS = 1;
export const MIN_PHOTOS = 1;
