import { cookies } from 'next/headers';

import DashboardPageClient from './DashboardPageClient';
import {
  DASHBOARD_TABS,
  DEFAULT_TAB,
  type DashboardTab,
} from './constants/dashboard.constants';
import { mapTabName } from './utils/dashboardHandlers';

type DashboardPageProps = {
  searchParams: {
    tab?: string;
  };
};

function resolveTab(tab?: string | null): DashboardTab | null {
  if (!tab) return null;
  const normalized = mapTabName(tab);
  return DASHBOARD_TABS.includes(normalized) ? normalized : null;
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  const cookieStore = cookies();
  const tabFromSearch = resolveTab(searchParams?.tab ?? null);
  const tabFromCookie = resolveTab(cookieStore.get('dashboardTab')?.value ?? null);
  const initialTab = tabFromSearch ?? tabFromCookie ?? DEFAULT_TAB;

  return <DashboardPageClient initialTab={initialTab} />;
}
