const env = (import.meta as any).env || {};
const base = env.VITE_API_BASE_URL;
if (!base) {
  throw new Error('VITE_API_BASE_URL tidak terkonfigurasi. Set di environment untuk produksi.');
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
  SUBMIT_STOCK_USAGE: `${API_BASE_URL}/webhook/submit-penggunaan-barang`
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
