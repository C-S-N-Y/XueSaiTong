import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { setToastFunction } from '../utils/helpers';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    setToastFunction((message, type = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    });
  }, []);
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  };
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id} className="glass-panel p-4 flex items-center gap-3 min-w-[280px]">
          {icons[toast.type]} <span className="text-sm text-white flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;