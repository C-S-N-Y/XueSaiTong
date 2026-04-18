import React from 'react';

const Panel = ({ children, className = '', glass = true, hover = true }) => {
  return (
    <div className={`${glass ? 'glass-panel' : 'bg-dark-surface/80 border border-white/5'} p-6 transition-all duration-300 ${hover ? 'hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-0.5' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Panel;