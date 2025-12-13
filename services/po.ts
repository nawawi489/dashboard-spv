import { ENDPOINTS } from '@constants';
import { POItem, ConfirmData } from '@types';
import { normalizePOList } from '@utils/normalizePO';

export const fetchPOList = async (): Promise<POItem[]> => {
  try {
    const response = await fetch(ENDPOINTS.GET_PO_LIST);
    if (!response.ok) {
      throw new Error(`Failed to fetch PO list: ${response.status} ${response.statusText}`);
    }
    const raw = await response.json();
    const normalized: POItem[] = normalizePOList(raw);
    return normalized;
  } catch (error) {
    console.warn('API Error (fetchPOList):', error);
    throw error;
  }
};

export const confirmPO = async (data: ConfirmData): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('id_transaksi', data.id_transaksi);
    formData.append('nama_barang', data.nama_barang);
    formData.append('jumlah_po', String(data.jumlah_po));
    formData.append('jumlah_diterima', String(data.jumlah_diterima));
    formData.append('satuan', data.satuan);
    formData.append('supplier', data.supplier);
    formData.append('id_barang', data.id_barang);
    formData.append('outlet', data.outlet);
    formData.append('nomor_invoice', data.nomor_invoice);
    formData.append('tanggal_konfirmasi', data.tanggal_konfirmasi);
    formData.append('status', data.jumlah_diterima >= data.jumlah_po ? 'DITERIMA' : 'KURANG');
    if (data.foto_nota) formData.append('foto_nota', data.foto_nota, data.foto_nota.name);
    if (data.foto_barang) formData.append('foto_barang', data.foto_barang, data.foto_barang.name);

    const response = await fetch(ENDPOINTS.CONFIRM_PO, { method: 'POST', body: formData });
    if (!response.ok) {
      throw new Error(`Failed to submit confirmation: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Error confirming PO:', error);
    throw error;
  }
};
