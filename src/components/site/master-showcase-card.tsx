import Link from 'next/link';
import { ArrowRight, ImageIcon } from 'lucide-react';

type MasterShowcaseCardProps = {
  href: string;
  name: string;
  specialty: string;
  categories: string[];
  imageUrl?: string | null;
};

export function MasterShowcaseCard({
  href,
  name,
  specialty,
  categories,
  imageUrl,
}: MasterShowcaseCardProps) {
  const focusAreas = (categories.length > 0 ? categories : [specialty]).slice(0, 4);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2.7rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(252,247,242,0.98)_52%,rgba(247,239,231,0.96)_100%)] p-6 shadow-[0_30px_80px_rgba(154,116,83,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_36px_96px_rgba(154,116,83,0.18),inset_0_1px_0_rgba(255,255,255,0.98)] sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-12 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0)_72%)] opacity-80" />
        <div className="absolute right-0 top-0 h-52 w-52 bg-[radial-gradient(circle,rgba(245,231,214,0.82)_0%,rgba(245,231,214,0)_70%)]" />
        <div className="absolute bottom-0 left-8 h-48 w-48 bg-[radial-gradient(circle,rgba(244,233,221,0.55)_0%,rgba(244,233,221,0)_72%)]" />
      </div>

      <div className="relative flex items-center justify-center gap-4 text-[0.72rem] uppercase tracking-[0.34em] text-[#b39479] sm:text-xs">
        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(191,160,132,0),rgba(191,160,132,0.45))]" />
        <span className="shrink-0 text-center">{specialty}</span>
        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(191,160,132,0.45),rgba(191,160,132,0))]" />
      </div>

      <div className="relative mx-auto mt-8 flex h-[18rem] w-[18rem] max-w-full items-center justify-center rounded-full border border-white/80 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.98),rgba(245,235,226,0.94)_68%,rgba(238,224,209,0.88)_100%)] p-3 shadow-[inset_0_0_0_1px_rgba(231,212,193,0.65)] sm:h-[20rem] sm:w-[20rem]">
        <div className="flex h-full w-full items-end justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.98),rgba(244,235,226,0.92)_58%,rgba(236,223,210,0.82)_100%)]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#b39479]">
              <ImageIcon className="h-10 w-10" />
              <p className="max-w-40 text-center text-sm font-medium">Фото специалиста появится здесь</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-8 text-center">
        <h3 className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-none text-[#5d4336]">{name}</h3>
      </div>

      <div className="relative mt-7 text-[#7f6858]">
        <p className="text-center text-lg leading-7 sm:text-[1.7rem] sm:leading-9">
          Работает по направлениям:
        </p>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-3 text-base leading-7 sm:text-[1.15rem] sm:leading-8">
          {focusAreas.map((category) => (
            <li key={category} className="flex items-start gap-3">
              <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#c8a788]" />
              <span className="max-w-52 text-left">{category}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={href}
        className="relative mt-10 inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-full border border-[#ead9ca] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,239,230,0.96))] px-6 text-lg font-medium text-[#6d5343] shadow-[0_10px_26px_rgba(181,144,109,0.14),inset_0_1px_0_rgba(255,255,255,0.96)] transition duration-300 hover:border-[#d9b99d] hover:text-[#5a4335] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b08d] focus-visible:ring-offset-2"
      >
        <span>Профиль специалиста</span>
        <ArrowRight className="h-5 w-5 transition duration-300 group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
