'use client';

import { useMemo, useState } from 'react';

import { MasterShowcaseCard } from '@/components/site/master-showcase-card';
import type { LiveSpecialist } from '@/lib/live-catalog';

export function MastersBrowser({
  masters
}: {
  masters: LiveSpecialist[];
}) {
  const [specialty, setSpecialty] = useState('all');

  const specialties = useMemo(
    () => ['all', ...new Set(masters.map((master) => master.specialtyLabel))],
    [masters]
  );

  const visibleMasters = useMemo(
    () =>
      masters.filter((master) => {
        return specialty === 'all' || master.specialtyLabel === specialty;
      }),
    [masters, specialty]
  );

  return (
    <div className="space-y-10">
      <div className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,241,235,0.92))] p-4 shadow-[0_20px_50px_rgba(154,116,83,0.1)] sm:max-w-sm">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.28em] text-[#a78569]">Специализация</span>
          <select
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            className="w-full rounded-[1.35rem] border border-[#ead9ca] bg-white/90 px-4 py-3 text-sm text-[#6d5343] outline-none transition focus:border-[#d2ae8c] focus:ring-2 focus:ring-[#e9d5c4]"
          >
            <option value="all">Все направления</option>
            {specialties
              .filter((value) => value !== 'all')
              .map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {visibleMasters.map((master) => (
          <MasterShowcaseCard
            key={master.slug}
            href={`/masters/${master.slug}`}
            name={master.name}
            specialty={master.specialtyLabel}
            categories={master.categoryNames}
            imageUrl={master.photo?.preferredUrl ?? null}
          />
        ))}
      </div>
    </div>
  );
}
