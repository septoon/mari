'use client';

import { UsersRound } from 'lucide-react';

import type { SpecialistCard } from '@/lib/api/contracts';

type StaffStepProps = {
  specialists: SpecialistCard[];
  selectedStaffId: string | 'any' | null;
  canChooseAnyStaff: boolean;
  onSelect: (staffId: string | 'any') => void;
};

const Avatar = ({ specialist }: { specialist?: SpecialistCard }) => {
  if (specialist?.photo?.preferredUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={specialist.photo.preferredUrl} alt={specialist.name} className="h-full w-full object-cover" />;
  }

  return specialist ? specialist.name.charAt(0).toUpperCase() : <UsersRound className="h-5 w-5" />;
};

export function StaffStep({
  specialists,
  selectedStaffId,
  canChooseAnyStaff,
  onSelect
}: StaffStepProps) {
  if (!specialists.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-6 text-sm text-[color:var(--muted)]">
        Для выбранной услуги сейчас нет специалистов с онлайн-записью.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {canChooseAnyStaff ? (
        <button
          type="button"
          onClick={() => onSelect('any')}
          aria-pressed={selectedStaffId === 'any'}
          className={`rounded-[1.6rem] border px-5 py-4 text-left transition ${
            selectedStaffId === 'any'
              ? 'border-[color:var(--foreground)] bg-[color:var(--foreground)] text-white shadow-[0_18px_48px_rgba(8,36,40,0.14)]'
              : 'border-[color:var(--line)] bg-white text-[color:var(--ink)] hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--panel)]'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${selectedStaffId === 'any' ? 'bg-white/14' : 'bg-[color:var(--panel)]'}`}>
              <Avatar />
            </span>
            <div>
              <p className="text-lg font-semibold">Любой специалист</p>
              <p className={`mt-1 text-sm ${selectedStaffId === 'any' ? 'text-white/80' : 'text-[color:var(--muted)]'}`}>
                Подберём ближайшее доступное время у подходящего мастера.
              </p>
            </div>
          </div>
        </button>
      ) : null}

      {specialists.map((specialist) => {
        const active = selectedStaffId === specialist.staffId;

        return (
          <button
            key={specialist.staffId}
            type="button"
            onClick={() => onSelect(specialist.staffId)}
            aria-pressed={active}
            className={`rounded-[1.6rem] border px-5 py-4 text-left transition ${
              active
                ? 'border-[color:var(--foreground)] bg-[color:var(--foreground)] text-white shadow-[0_18px_48px_rgba(8,36,40,0.14)]'
                : 'border-[color:var(--line)] bg-white text-[color:var(--ink)] hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--panel)]'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-semibold ${active ? 'bg-white/14' : 'bg-[color:var(--panel)]'}`}>
                <Avatar specialist={specialist} />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold">{specialist.name}</p>
                <p className={`mt-1 text-sm ${active ? 'text-white/80' : 'text-[color:var(--muted)]'}`}>
                  {specialist.specialty || 'Специалист салона'}
                </p>
                <p className={`mt-3 text-sm leading-6 ${active ? 'text-white/80' : 'text-[color:var(--muted)]'}`}>
                  {specialist.info?.trim() || 'Онлайн-запись доступна у этого специалиста.'}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
