'use client';

type CategoryStepProps = {
  categories: Array<{
    id: string;
    name: string;
    servicesCount: number;
    description: string | null;
  }>;
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
};

export function CategoryStep({
  categories,
  selectedCategoryId,
  onSelect
}: CategoryStepProps) {
  return (
    <div className="grid gap-3">
      {categories.map((category) => {
        const active = category.id === selectedCategoryId;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            aria-pressed={active}
            className={`rounded-[1.6rem] border px-5 py-4 text-left transition ${
              active
                ? 'border-(--foreground) bg-(--foreground) text-white shadow-[0_18px_48px_rgba(8,36,40,0.14)]'
                : 'border-(--line) bg-white text-(--ink) hover:border-(--accent-strong) hover:bg-(--panel)'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-lg font-semibold">{category.name}</p>
                <p className={`mt-2 text-sm leading-6 ${active ? 'text-white/80' : 'text-(--muted)'}`}>
                  {category.description || `Доступно услуг: ${category.servicesCount}`}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  active ? 'bg-white/14 text-white' : 'bg-(--panel) text-(--muted-strong)'
                }`}
              >
                {category.servicesCount}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
