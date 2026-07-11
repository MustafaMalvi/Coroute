const MiniBarChart = ({ data, color = '#F5AE0E' }) => {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full h-40 flex items-end gap-2">
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 group">
            <span className="text-[10px] font-meter text-ink/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {d.value}
            </span>
            <div
              className="w-full rounded-t-md transition-all duration-700 ease-out"
              style={{
                height: `${Math.max(heightPct, 3)}%`,
                backgroundColor: color,
                opacity: d.value === 0 ? 0.15 : 0.85,
              }}
            ></div>
            <span className="text-[10px] text-ink/40 font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MiniBarChart;
