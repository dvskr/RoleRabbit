import { redirect } from 'next/navigation';

export default function DashboardResumeEditorPage() {
  redirect('/dashboard?tab=editor');
}
