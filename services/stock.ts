import { ENDPOINTS } from '../constants';
import { StockItem, StockUsageSubmission } from '../types';

export const fetchStockItems = async (): Promise<StockItem[]> => {
  try {
    const response = await fetch(ENDPOINTS.GET_DB_BARANG);
    if (!response.ok) {
      throw new Error('Gagal mengambil data barang');
    }
    const data = await response.json();
    
    // Normalize data structure based on n8n workflow response
    return data.map((item: any, index: number) => ({
      id: String(item.row_number || index),
      nama_barang: item.Barang || item.nama_barang || item.name,
      satuan: item["Satuan Konversi"] || item.satuan || 'pcs',
      kategori: item.Kategori || 'Umum'
    }));
  } catch (error) {
    console.error('Error fetching stock items:', error);
    throw error;
  }
};

export const submitStockUsage = async (data: StockUsageSubmission): Promise<void> => {
  try {
    const response = await fetch(ENDPOINTS.SUBMIT_STOCK_USAGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Gagal mengirim laporan pemakaian stok');
    }
  } catch (error) {
    console.error('Error submitting stock usage:', error);
    throw error;
  }
};

export const submitStockOpname = async (data: StockUsageSubmission): Promise<void> => {
  try {
    const response = await fetch(ENDPOINTS.SUBMIT_STOCK_OPNAME, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Gagal mengirim laporan stok opname');
    }
  } catch (error) {
    console.error('Error submitting stock opname:', error);
    throw error;
  }
};
