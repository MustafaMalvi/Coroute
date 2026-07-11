import { useEffect, useState, useRef } from 'react';

const StatCard = ({ label, value, prefix = '', suffix = '', accent = 'marigold', icon }) => {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const duration = 700;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  const accentClasses = {
    marigold: 'bg-marigold-500/10 text-marigold-600',
    route: 'bg-route-50 text-route-600',
    rose: 'bg-rose-50 text-rose-500',
    ink: 'bg-ink/5 text-ink',
  };

  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
      {icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accentClasses[accent] || accentClasses.marigold}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none tabular-nums">
          {prefix}{display}{suffix}
        </p>
        <p className="text-xs text-ink-600 font-medium mt-1.5 truncate">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
