import React from 'react';

const SectionTitle = ({ eyebrow, title, desc, className = '' }) => {
  return (
    <div className={`mb-6 ${className}`}>
      {eyebrow && <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 block">{eyebrow}</span>}
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {desc && <p className="mt-2 text-sm text-gray-400">{desc}</p>}
    </div>
  );
};

export default SectionTitle;