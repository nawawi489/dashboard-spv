import React, { useState, useEffect, useMemo } from 'react';
import { AppState, AppView, TaskData, getTaskId } from '@types';
import { fetchTasks } from '@services/tasks';
import Header from '@components/common/Header';
import OutletSelector from '@components/common/OutletSelector';
import MainMenu from '@components/common/MainMenu';
import Footer from '@components/common/Footer';
import TaskCard from '@features/daily/TaskCard';
import DepositForm from '@features/deposit/DepositForm';
import Login from '@features/auth/Login';
import PODashboard from '@features/po/PODashboard';
import { Loader2, RefreshCw, Filter, ChevronDown, CheckCircle2, ArrowLeft } from 'lucide-react';
import { getTodayDateJakarta } from '@utils/date';

const STORAGE_KEY = 'spv_checklist_state';
const SESSION_KEY = 'spv_session';
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

interface NotificationState {
  id: number;
  message: string;
}

function App() {
  const [state, setState] = useState<AppState>(() => {
    // Try to restore session from local storage
    const saved = localStorage.getItem(STORAGE_KEY);
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Session check
        let sessionValid = false;
        if (sessionRaw) {
          try {
            const s = JSON.parse(sessionRaw);
            if (s && typeof s.loginAt === 'number' && typeof s.user === 'string') {
              const expiresAt = s.loginAt + SESSION_DURATION_MS;
              if (Date.now() < expiresAt) {
                sessionValid = true;
                parsed.user = s.user;
                parsed.loginAt = s.loginAt;
              }
            }
          } catch {}
        }
        // Auto-reset if date is not today (e.g. new day)
        const today = getTodayDateJakarta();
        if (parsed.selectedDate && parsed.selectedDate !== today) {
          return {
            view: sessionValid ? AppView.SELECT_OUTLET : AppView.LOGIN,
            selectedOutlet: parsed.selectedOutlet || '',
            selectedDate: '',
            tasks: [],
            completedTasks: [],
            user: sessionValid ? parsed.user : undefined,
            loginAt: sessionValid ? parsed.loginAt : undefined,
          };
        }
        return sessionValid ? parsed : { ...parsed, view: AppView.LOGIN, user: undefined, loginAt: undefined };
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      view: AppView.LOGIN,
      selectedOutlet: '',
      selectedDate: '',
      tasks: [],
      completedTasks: [],
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('SEMUA');
  const [taskPage, setTaskPage] = useState<number>(1);
  const TASK_PAGE_SIZE = 6;
  
  // Notification State: Object ensures unique updates even if message is same
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Geolocation State
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Persist session when user or loginAt changes
  useEffect(() => {
    if (state.user && state.loginAt) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: state.user, loginAt: state.loginAt }));
    }
  }, [state.user, state.loginAt]);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    setTaskPage(1);
  }, [activeCategory, state.tasks]);

  // Auto logout when session expires (12h)
  useEffect(() => {
    if (state.loginAt) {
      const expiresAt = state.loginAt + SESSION_DURATION_MS;
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        logout();
        return;
      }
      const timer = setTimeout(() => logout(), remaining);
      return () => clearTimeout(timer);
    }
  }, [state.loginAt]);

  const login = (user: string) => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      view: AppView.SELECT_OUTLET,
      user,
      loginAt: now,
    }));
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setState(prev => ({
      ...prev,
      view: AppView.LOGIN,
      user: undefined,
      loginAt: undefined,
      selectedOutlet: '',
      selectedDate: '',
      tasks: [],
      completedTasks: [],
    }));
  };

  // Request Geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          // Log as info/debug instead of warning to avoid cluttering console if permission is simply denied
          console.log("Geolocation access denied or failed", err.message);
        },
        { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
      );
    }
  }, []);

  const handleOutletSelect = (outlet: string, date: string) => {
    setState(prev => ({
      ...prev,
      view: AppView.SELECT_FEATURE,
      selectedOutlet: outlet,
      selectedDate: date
    }));
  };

  const handleFeatureSelect = (feature: 'TASK' | 'DEPOSIT' | 'PO') => {
    if (feature === 'TASK') {
      loadTasks(state.selectedOutlet, state.selectedDate);
    } else if (feature === 'DEPOSIT') {
      setState(prev => ({ ...prev, view: AppView.DEPOSIT }));
    } else {
      setState(prev => ({ ...prev, view: AppView.PO }));
    }
  };

  const loadTasks = async (outlet: string, date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // PASS OUTLET NAME TO API
      const tasks = await fetchTasks(outlet);
      
      const day = parseInt(date.split('-')[2], 10);
      const preCompletedIds: string[] = [];
      const variants = [
        `tanggal ${day}`,
        `tgl ${day}`,
        `tanggal ${String(day).padStart(2,'0')}`,
        `tgl ${String(day).padStart(2,'0')}`,
        `tanggal${day}`,
        `tgl${day}`
      ];

      tasks.forEach(task => {
        let matched = false;
        for (const key of Object.keys(task)) {
          const norm = String(key).toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
          if (variants.includes(norm)) {
            const val = (task as any)[key];
            if ((typeof val === 'string' && val.trim().length > 0) ||
                (typeof val === 'number' && !isNaN(val) && val !== 0) ||
                (typeof val === 'boolean' && val)) {
              matched = true;
              break;
            }
          }
        }
        if (matched) {
          preCompletedIds.push(getTaskId(task));
        }
      });

      setState(prev => ({
        ...prev,
        view: AppView.CHECKLIST,
        tasks: tasks,
        // Sync completedTasks with the data from the sheet (pre-filled columns)
        // This ensures if "Tanggal 1" is filled, it shows as done.
        completedTasks: preCompletedIds
      }));
      setActiveCategory('SEMUA');
    } catch (err) {
      setError("Gagal memuat daftar tugas. Periksa koneksi internet.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskComplete = (taskId: string) => {
    setState(prev => ({
      ...prev,
      completedTasks: [...prev.completedTasks, taskId]
    }));
    // Trigger success notification with unique ID
    setNotification({ id: Date.now(), message: "Laporan berhasil dikirim!" });
  };

  const handleTaskFail = (taskId: string) => {
    setState(prev => ({
      ...prev,
      completedTasks: prev.completedTasks.filter(id => id !== taskId)
    }));
  };

  const handleBack = () => {
    if (state.view === AppView.CHECKLIST || state.view === AppView.DEPOSIT || state.view === AppView.PO) {
      setState(prev => ({ ...prev, view: AppView.SELECT_FEATURE }));
    } else if (state.view === AppView.SELECT_FEATURE) {
      setState(prev => ({ ...prev, view: AppView.SELECT_OUTLET }));
    }
  };

  // Helper to safely get category
  const getCategoryName = (t: TaskData) => String(t.Kategoriugas || t.KategoriTugas || 'LAINNYA').toUpperCase();

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(state.tasks.map(getCategoryName));
    return ['SEMUA', ...Array.from(cats).sort()];
  }, [state.tasks]);

  // ---------------- Render Views ----------------

  if (state.view === AppView.LOGIN) {
    return <Login onLogin={login} />;
  }

  if (state.view === AppView.SELECT_OUTLET) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-4">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="font-medium animate-pulse">Mengambil data tugas...</p>
        </div>
      );
    }
    
    return (
      <>
        {error && (
            <div className="fixed top-0 left-0 w-full bg-red-500 text-white p-4 text-center z-[100] shadow-lg">
                {error}
                <button onClick={() => setError(null)} className="ml-4 underline font-bold">Tutup</button>
            </div>
        )}
        <OutletSelector 
          onStart={handleOutletSelect} 
          initialOutlet={state.selectedOutlet}
          initialDate={state.selectedDate}
          onLogout={logout}
        />
      </>
    );
  }

  if (state.view === AppView.SELECT_FEATURE) {
    return (
      <MainMenu 
        outlet={state.selectedOutlet}
        onSelectFeature={handleFeatureSelect}
        onBack={handleBack}
      />
    );
  }

  if (state.view === AppView.DEPOSIT) {
    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-3">
             <button onClick={handleBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
               <ArrowLeft size={20} />
             </button>
             <h1 className="font-bold text-slate-800 text-lg">Input Bukti Setoran</h1>
             {state.user && (
               <div className="ml-auto text-xs text-slate-500">{state.user}</div>
             )}
          </div>
        </div>

        <main className="max-w-md mx-auto p-4">
          <DepositForm 
            outlet={state.selectedOutlet} 
          />
          
          {/* Success Notification Toast */}
          <div 
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform w-max max-w-[90%]
              ${notification ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
          >
            {notification && (
              <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl shadow-green-900/20 flex items-center gap-3 font-semibold text-sm backdrop-blur-sm border border-green-500">
                <CheckCircle2 size={20} className="text-green-100 flex-shrink-0" />
                <span>{notification.message}</span>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (state.view === AppView.PO) {
    return (
      <PODashboard outlet={state.selectedOutlet} onBack={handleBack} />
    );
  }

  if (state.view === AppView.CHECKLIST) {
    const totalTasks = state.tasks.length;
    const completedCount = state.completedTasks.length;
    const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
    
    // Sort tasks: Incomplete first, then completed
    const sortedTasks = [...state.tasks].sort((a, b) => {
      const idA = getTaskId(a);
      const idB = getTaskId(b);
      const doneA = state.completedTasks.includes(idA);
      const doneB = state.completedTasks.includes(idB);
      if (doneA === doneB) return 0;
      return doneA ? 1 : -1;
    });

    // Filter tasks based on category
    const filteredTasks = sortedTasks.filter(task => {
      if (activeCategory === 'SEMUA') return true;
      return getCategoryName(task) === activeCategory;
    });

    const totalTaskPages = Math.max(1, Math.ceil(filteredTasks.length / TASK_PAGE_SIZE));
    const taskStartIndex = (taskPage - 1) * TASK_PAGE_SIZE;
    const paginatedTasks = filteredTasks.slice(taskStartIndex, taskStartIndex + TASK_PAGE_SIZE);

    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        {/* Loading Overlay during Reload */}
        {isLoading && (
          <div className="fixed inset-0 z-[60] bg-white/50 backdrop-blur-sm flex items-center justify-center">
             <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-slate-100">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <p className="text-sm font-medium text-slate-600">Memuat data...</p>
             </div>
          </div>
        )}

        <Header 
          title={state.selectedOutlet} 
          subtitle={state.selectedDate} 
          onBack={handleBack}
          onReload={() => loadTasks(state.selectedOutlet, state.selectedDate)}
          progress={progress}
          
        />
        
        
        <main className="max-w-md mx-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => window.location.reload()}><RefreshCw size={16}/></button>
            </div>
          )}

          <div className="flex justify-between items-end px-1">
            <h2 className="text-xl font-bold text-slate-800">Daftar Tugas</h2>
            <span className="text-sm font-medium text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
              {completedCount} / {totalTasks} Selesai
            </span>
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Filter size={16} />
            </div>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3 pl-10 pr-10 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'SEMUA' ? 'Tampilkan Semua Kategori' : cat}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="space-y-3 min-h-[50vh]">
            {filteredTasks.length > 0 ? (
              paginatedTasks.map((task, index) => {
                const taskId = getTaskId(task);
                const isCompleted = state.completedTasks.includes(taskId);
                return (
                  <TaskCard
                    key={taskId}
                    task={task}
                    outlet={state.selectedOutlet}
                    date={state.selectedDate}
                    isCompleted={isCompleted}
                    onComplete={handleTaskComplete}
                    onFail={handleTaskFail}
                    coordinates={coordinates}
                  />
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                <Filter size={32} className="opacity-50" />
                <p>Tidak ada tugas di kategori ini.</p>
                <button 
                  onClick={() => setActiveCategory('SEMUA')}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Tampilkan Semua
                </button>
              </div>
            )}
          </div>

          {filteredTasks.length > 0 && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500">
                Menampilkan {filteredTasks.length === 0 ? 0 : taskStartIndex + 1}–{Math.min(taskStartIndex + TASK_PAGE_SIZE, filteredTasks.length)} dari {filteredTasks.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTaskPage(p => Math.max(1, p - 1))}
                  disabled={taskPage === 1}
                  className="px-3 py-1 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs text-slate-600">Halaman {taskPage} / {totalTaskPages}</span>
                <button
                  onClick={() => setTaskPage(p => Math.min(totalTaskPages, p + 1))}
                  disabled={taskPage === totalTaskPages}
                  className="px-3 py-1 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {progress === 100 && state.tasks.length > 0 && (
             <div className="mt-8 p-6 bg-green-600 rounded-2xl text-white text-center shadow-lg shadow-green-200">
                <h3 className="text-2xl font-bold mb-2">Semua Tugas Selesai! 🎉</h3>
                <p className="opacity-90">Terima kasih telah menyelesaikan checklist hari ini.</p>
                <button 
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    setState(prev => ({...prev, view: AppView.SELECT_OUTLET, completedTasks: [], tasks: []}));
                  }}
                  className="mt-4 px-6 py-2 bg-white text-green-700 font-bold rounded-full text-sm hover:bg-green-50 transition-colors"
                >
                  Tutup & Keluar
                </button>
             </div>
          )}
        </main>

        {/* Success Notification Toast */}
        <div 
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform w-max max-w-[90%]
            ${notification ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
        >
          {notification && (
            <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl shadow-green-900/20 flex items-center gap-3 font-semibold text-sm backdrop-blur-sm border border-green-500">
              <CheckCircle2 size={20} className="text-green-100 flex-shrink-0" />
              <span>{notification.message}</span>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return null;
}

export default App;
