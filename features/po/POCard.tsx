import React from 'react';
import { PackageCheck, Store, Truck, DollarSign, Layers } from 'lucide-react';
import { POItem } from '@types';
import { formatRupiah } from '@utils/formatRupiah';

interface POCardProps {
  data: POItem;
  onConfirm: (item: POItem) => void;
}

const POCard: React.FC<POCardProps> = ({ data, onConfirm }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 flex justify-between items-center">
        <span className="text-white font-mono text-sm font-semibold tracking-wider opacity-90">#{data.id_transaksi}</span>
        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">PO</span>
      </div>

      <div className="p-5 flex-1 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{data.nama_barang}</h3>
            <div className="flex items-center text-sm text-gray-500 gap-1">
              <Store size={14} />
              <span>{data.outlet}</span>
            </div>
          </div>
          {data.id_barang && (
            <span className="text-[11px] font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">{data.id_barang}</span>
          )}
        </div>
        <hr className="border-gray-100" />
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-xs mb-0.5 flex items-center gap-1">
              <Truck size={12} /> Supplier
            </p>
            <p className="font-medium text-gray-800 truncate" title={data.supplier}>{data.supplier}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-xs mb-0.5 flex items-center gap-1">
              <Layers size={12} /> Jumlah PO
            </p>
            <p className="font-medium text-gray-800">{data.satuan ? `${data.jumlah_po} ${String(data.satuan).toLowerCase()}` : data.jumlah_po}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-xs mb-0.5 flex items-center gap-1">
              <DollarSign size={12} /> Harga Satuan
            </p>
            <p className="font-medium text-gray-800">{formatRupiah(data.harga_satuan)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-xs mb-0.5 font-semibold text-blue-600">Total Harga</p>
            <p className="font-bold text-blue-700">{formatRupiah(data.total_harga)}</p>
          </div>
        </div>
      </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => onConfirm(data)}
          aria-label="Konfirmasi Barang"
          className="w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm"
        >
          <PackageCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Konfirmasi Barang
        </button>
      </div>
    </div>
  );
};

export default POCard;
