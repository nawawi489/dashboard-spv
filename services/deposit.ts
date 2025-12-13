import { ENDPOINTS } from '../constants';
import { DepositSubmission } from '../types';

export const submitDeposit = async (payload: DepositSubmission): Promise<any> => {
  try {
    const response = await fetch(ENDPOINTS.SUBMIT_DEPOSIT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error (${response.status}): ${errorText || response.statusText || 'Unknown Error'}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('API Error (submitDeposit):', error);
    throw error;
  }
};

export const fetchCashSum = async (outlet: string, startDate: string, endDate: string): Promise<number> => {
  try {
    const url = new URL(ENDPOINTS.GET_CASH_SUM);
    url.searchParams.append('outlet', outlet);
    url.searchParams.append('start', startDate);
    url.searchParams.append('end', endDate);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Server Error (${response.status}): ${text || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const data = await response.json();
      if (typeof data === 'number') return data;
      if (data && typeof data === 'object') {
        if (typeof (data as any).total === 'number') return (data as any).total;
        if (Array.isArray(data)) {
          if (data.length > 0) {
            const first: any = data[0] && typeof data[0] === 'object' ? data[0] : {};
            const obj = (first && typeof first.json === 'object') ? first.json : first;
            const tanggalArr = obj && obj['Tanggal'];
            const amountArr = obj && obj['Uang Tunai Yang Ada'];
            if (Array.isArray(tanggalArr) && Array.isArray(amountArr) && tanggalArr.length === amountArr.length) {
              const parseDateFlexible = (s: any): Date | null => {
                if (typeof s !== 'string') return null;
                const str = s.trim();
                if (/^\d{4}-\d{2}-\d{2}$/.test(str)) { const d = new Date(str + 'T00:00:00'); return isNaN(d.getTime()) ? null : d; }
                const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
                if (m) { const dd = parseInt(m[1],10); const mm = parseInt(m[2],10)-1; const yyyy = parseInt(m[3].length===2?('20'+m[3]):m[3],10); const d = new Date(yyyy,mm,dd); return isNaN(d.getTime())?null:d; }
                const d = new Date(str); return isNaN(d.getTime())?null:d;
              };
              const sDate = parseDateFlexible(startDate);
              const eDate = parseDateFlexible(endDate);
              if (sDate && eDate) {
                const sn = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()).getTime();
                const en = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate()).getTime();
                let sum = 0;
                for (let i = 0; i < tanggalArr.length; i++) {
                  const d = parseDateFlexible(tanggalArr[i]);
                  if (!d) continue;
                  const dn = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                  if (dn >= sn && dn <= en) {
                    const v = amountArr[i];
                    if (typeof v === 'number') sum += v;
                    else if (typeof v === 'string' && v) {
                      const n = parseFloat(String(v).replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.'));
                      if (!isNaN(n)) sum += n;
                    }
                  }
                }
                return sum;
              }
            }
          }
          const targetAmountKeyNorm = 'uang tunai yang ada';
          const targetDateKeyNorm = 'tanggal';

          const parseDateFlexible = (s: any): Date | null => {
            if (typeof s !== 'string') return null;
            const str = s.trim();
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
              const d = new Date(str + 'T00:00:00');
              return isNaN(d.getTime()) ? null : d;
            }
            const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
            if (m) {
              const dd = parseInt(m[1], 10);
              const mm = parseInt(m[2], 10) - 1;
              const yyyy = parseInt(m[3].length === 2 ? ('20' + m[3]) : m[3], 10);
              const d = new Date(yyyy, mm, dd);
              return isNaN(d.getTime()) ? null : d;
            }
            const d = new Date(str);
            return isNaN(d.getTime()) ? null : d;
          };

          const sDate = parseDateFlexible(startDate);
          const eDate = parseDateFlexible(endDate);

          const itemsInRange = (data as any[]).filter((item: any) => {
            const keys = Object.keys(item);
            let dateKey: string | undefined;
            for (const k of keys) {
              const norm = String(k).toLowerCase().trim();
              if (norm === targetDateKeyNorm) { dateKey = k; break; }
            }
            if (!dateKey) return true;
            const d = parseDateFlexible(item[dateKey]);
            if (!d || !sDate || !eDate) return false;
            const dn = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const sn = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()).getTime();
            const en = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate()).getTime();
            return dn >= sn && dn <= en;
          });

          return itemsInRange.reduce((sum: number, item: any) => {
            let val = 0;
            const keys = Object.keys(item);
            let matchedKey: string | undefined;
            for (const k of keys) {
              const norm = String(k).toLowerCase().trim().replace(/\s+/g, ' ');
              if (norm === targetAmountKeyNorm) { matchedKey = k; break; }
            }
            if (!matchedKey) {
              const fallbackKeys = ['total','amount','nominal','uang'];
              for (const fk of fallbackKeys) {
                if (typeof item[fk] !== 'undefined') { matchedKey = fk; break; }
              }
            }
            if (matchedKey) {
              const v = item[matchedKey];
              if (typeof v === 'number') val = v;
              else if (typeof v === 'string') {
                const n = parseFloat(v.replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.'));
                if (!isNaN(n)) val = n;
              }
            }
            return sum + (isNaN(val) ? 0 : val);
          }, 0);
        }
      }
      return 0;
    } else {
      const text = await response.text();
      const n = parseFloat(text.replace(/[^0-9.-]/g, ''));
      return isNaN(n) ? 0 : n;
    }
  } catch (error) {
    console.error('API Error (fetchCashSum):', error);
    throw error;
  }
};
