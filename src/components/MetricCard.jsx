import React, { useEffect, useState } from 'react';
import Panel from './Panel';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, change, icon: Icon, color = 'cyan' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const duration = 800, steps = 20, increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplayValue(value); clearInterval(timer); }
      else setDisplayValue(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const colorMap = {
    cyan: 'from-cyan-500 to-blue-500',
    fuchsia: 'from-fuchsia-500 to-purple-500',
    green: 'from-emerald-500 to-teal-500',
  };

  return (
    <Panel className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">{displayValue.toLocaleString()}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center text-xs">
              {change >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400 mr-1" /> : <TrendingDown className="w-3 h-3 text-red-400 mr-1" />}
              <span className={change >= 0 ? 'text-emerald-400' : 'text-red-400'}>{Math.abs(change)}%</span>
              <span className="text-gray-500 ml-1">vs 上月</span>
            </div>
          )}
        </div>
        {Icon && <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} bg-opacity-10`}><Icon className="w-5 h-5 text-white" /></div>}
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors duration-500"></div>
    </Panel>
  );
};

export default MetricCard;