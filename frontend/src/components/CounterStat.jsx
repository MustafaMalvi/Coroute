import { useEffect, useRef, useState } from 'react';

const CounterStat = ({ value, label, suffix = '', decimals = 0 }) => {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 1400;
    const start = performance.now();

    let frame;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const raw = value * eased;
      setDisplay(decimals > 0 ? Number(raw.toFixed(decimals)) : Math.round(raw));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value, decimals]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-4xl sm:text-5xl text-marigold-500 tabular-nums">
        {decimals > 0 ? display.toFixed(decimals) : display}{suffix}
      </p>
      <p className="text-paper/50 text-sm mt-2 font-medium">{label}</p>
    </div>
  );
};

export default CounterStat;
