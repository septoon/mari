import { NextResponse } from 'next/server';

import { getLiveCatalog } from '@/lib/live-catalog';
import {
  getVisibleSiteFooterNav,
  getVisibleSiteFooterUtilityNav,
  getVisibleSiteNav,
} from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET() {
  const catalog = await getLiveCatalog();
  const extra = catalog.bootstrap.config.extra;

  return NextResponse.json(
    {
      navItems: getVisibleSiteNav(extra),
      footerNav: getVisibleSiteFooterNav(extra),
      footerUtilityNav: getVisibleSiteFooterUtilityNav(extra),
      version: catalog.bootstrap.version,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
