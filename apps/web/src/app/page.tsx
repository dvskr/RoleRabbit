'use client';

import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to landing page by default
  redirect('/landing');
}
