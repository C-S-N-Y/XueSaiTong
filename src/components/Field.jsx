import React from 'react';

export const Input = ({ label, error, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <input className={`w-full px-4 py-2.5 bg-dark-surface/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500/50' : ''} ${className}`} {...props} />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <textarea className={`w-full px-4 py-2.5 bg-dark-surface/80 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500/50' : ''} ${className}`} rows={4} {...props} />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

export const Select = ({ label, options, error, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <select className={`w-full px-4 py-2.5 bg-dark-surface/80 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500/50' : ''} ${className}`} {...props}>
      {options.map(opt => <option key={opt.value} value={opt.value} className="bg-dark-surface">{opt.label}</option>)}
    </select>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);