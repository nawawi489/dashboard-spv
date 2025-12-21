import { POItem } from '@types';

export const normalizePOList = (raw: any): POItem[] => {
  const arr = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.data) ? raw.data : []);
  return (arr as any[])
    .filter(item => {
      const statusOk = String(item.VerifikasiFinance || '').toLowerCase() === 'terima';
      const v = item.VerifikasiSPV ?? item['VerifSPV'];
      const s = String(v).toLowerCase();
      const verifFalse = v === false || s === 'false' || v === 0 || s === '0';
      return statusOk && verifFalse;
    })
    .map(item => ({
      id_transaksi: String(item['ID TRANSAKSI'] || item.id_transaksi || ''),
      nama_barang: String(item['NAMA BARANG'] || item.nama_barang || ''),
      outlet: String(item.outlet || ''),
      jumlah_po: Number(item['JUMLAH'] ?? item.jumlah_po ?? 0),
      harga_satuan: Number(item['HARGA'] ?? item.harga_satuan ?? 0),
      total_harga: Number(item['TOTAL HARGA'] ?? item.total_harga ?? 0),
      supplier: String(item['NAMA SUPLIER'] ?? item.supplier ?? ''),
      id_barang: String(item['ID BARANG'] ?? item.id_barang ?? ''),
      satuan: String(item['SATUAN'] ?? item.satuan ?? ''),
    }));
};

