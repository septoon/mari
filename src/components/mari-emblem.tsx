type MariEmblemProps = {
  compact?: boolean;
};

export function MariEmblem({ compact = false }: MariEmblemProps) {
  return (
    <div className={`relative isolate ${compact ? 'w-[180px]' : 'w-[280px] max-w-full'}`}>
      <div className="absolute inset-[8%] -z-10 rounded-full border border-[color:var(--line)] opacity-70" />
      <div className="absolute inset-[3%] -z-10 rounded-full border border-[color:var(--line)] opacity-40" />
      <div className="absolute right-[14%] top-[18%] h-3 w-3 rotate-45 rounded-[4px] bg-[color:var(--mist-strong)] opacity-70" />
      <div className="absolute left-[12%] top-[72%] h-2 w-2 rotate-45 rounded-[3px] bg-[color:var(--mist-strong)] opacity-70" />
      <div className="absolute bottom-[9%] left-[44%] h-2.5 w-2.5 rotate-45 rounded-[3px] bg-[color:var(--gold)] opacity-80" />
      <div className="relative flex aspect-square flex-col items-center justify-center rounded-full border border-white/40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(239,234,228,0.75)_58%,rgba(225,230,228,0.48)_100%)] px-8 text-center shadow-[0_30px_80px_rgba(12,77,85,0.14)] backdrop-blur">
        <p className="mb-5 font-serif text-[0.62rem] uppercase tracking-[0.45em] text-[color:var(--ink-muted)]">
          Атмосфера красоты и вдохновения
        </p>
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/80 text-[color:var(--ink)] shadow-inner shadow-[rgba(12,77,85,0.08)]">
          <span className={`${compact ? 'text-5xl' : 'text-6xl'} font-serif leading-none`}>M</span>
        </div>
        <p className={`${compact ? 'mt-4 text-4xl' : 'mt-5 text-6xl'} font-serif tracking-[0.28em] text-[color:var(--ink)]`}>
          MARI
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.48em] text-[color:var(--ink-muted)]">Beauty Salon</p>
      </div>
    </div>
  );
}
