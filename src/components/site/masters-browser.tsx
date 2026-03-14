'use client';

import { useMemo, useState } from 'react';

import { MasterCard } from '@/components/cards/master-card';
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
    <div className="space-y-8">
      <div className="rounded-[1.75rem] border border-[color:var(--line)] bg-white/72 p-4 sm:max-w-sm">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Специализация</span>
          <select
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm text-[color:var(--foreground)] outline-none"
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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleMasters.map((master) => (
          <MasterCard
            key={master.slug}
            href={`/masters/${master.slug}`}
            name={master.name}
            specialty={master.specialtyLabel}
            summary={master.summary}
            servicesCount={master.services.length}
            categories={master.categoryNames}
          />
        ))}
      </div>
    </div>
  );
}
