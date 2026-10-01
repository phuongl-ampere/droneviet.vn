type Metric = {
  label: string;
  value: string;
};

type LabVisualProps = {
  metrics: Metric[];
};

export function LabVisual({ metrics }: LabVisualProps) {
  return (
    <div className="relative min-h-[340px] overflow-hidden rounded-lg border border-white/12 bg-[#071017] p-4 shadow-2xl shadow-cyan-950/30 sm:min-h-[420px] sm:p-5">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,209,193,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,209,193,0.08)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute left-1/2 top-16 h-56 w-56 -translate-x-1/2 rounded-full border border-[#00D1C1]/20 bg-[#00D1C1]/8 blur-[1px]" />
      <div className="relative z-10 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#00D1C1]">
          Lab telemetry
        </p>
        <span className="rounded-full border border-[#FFB020]/30 px-3 py-1 font-mono text-xs text-[#FFB020]">
          EDU-FLIGHT-01
        </span>
      </div>

      <div className="relative z-10 mt-10 grid place-items-center sm:mt-16">
        <div className="relative h-40 w-64 sm:h-48 sm:w-72">
          <div className="absolute left-1/2 top-1/2 h-18 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-[#00D1C1]/45 bg-[#0B1117] shadow-[0_0_50px_rgba(0,209,193,0.28)] sm:h-20 sm:w-28" />
          <div className="absolute left-1/2 top-1/2 h-3 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D1C1]/45 sm:w-56" />
          <div className="absolute left-1/2 top-1/2 h-32 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D1C1]/45 sm:h-40" />
          {[
            "left-0 top-0",
            "right-0 top-0",
            "bottom-0 left-0",
            "bottom-0 right-0",
          ].map((position) => (
            <div
              key={position}
              className={`absolute ${position} grid size-16 place-items-center rounded-full border border-[#00D1C1]/35 bg-[#00D1C1]/10 sm:size-20`}
            >
              <span className="size-11 rounded-full border-2 border-dashed border-[#F7FAFC]/55 sm:size-14" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-white/10 bg-white/6 p-2.5 sm:p-4"
          >
            <p className="font-mono text-[9px] uppercase leading-tight tracking-[0.1em] text-slate-400 sm:text-[11px] sm:tracking-[0.16em]">
              {metric.label}
            </p>
            <p className="mt-2 text-sm font-semibold leading-tight text-white sm:text-xl">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
