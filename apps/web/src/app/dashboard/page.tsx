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
  let tabFromCookie: DashboardTab | null = null;
  
  try {
    const cookieStore = cookies();
    if (cookieStore) {
      const dashboardTabCookie = cookieStore.get('dashboardTab');
      tabFromCookie = resolveTab(dashboardTabCookie?.value ?? null);
    }
  } catch (error) {
    // cookieStore might be null or unavailable in some contexts, handle gracefully
    console.error('Error reading cookie store:', error);
  }
  
  const tabFromSearch = resolveTab(searchParams?.tab ?? null);
  const initialTab = tabFromSearch ?? tabFromCookie ?? DEFAULT_TAB;

  return <DashboardPageClient initialTab={initialTab} />;
}

