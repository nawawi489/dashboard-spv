import React from 'react';
import { ArrowLeft, CheckSquare, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onReload?: () => void;
  progress?: number;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onBack, onReload, progress }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm safe-top">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-3 -ml-3 text-slate-600 hover:bg-slate-100 rounded-full transition-colors touch-manipulation"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {onReload && (
              <button 
                onClick={onReload}
                className="p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all active:scale-95"
                title="Reload Data"
              >
                  <RefreshCw size={20} />
              </button>
            )}
            
            {!onBack && !onReload && (
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                 <CheckSquare size={20} />
              </div>
            )}
          </div>
        </div>
        
        {typeof progress === 'number' && (
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
