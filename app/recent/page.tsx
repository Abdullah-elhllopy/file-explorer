

import { getRecentFiles } from '@/lib/data';

import RecentFiles from '@/components/RecentFiles';


export default async function RecentPage() {

  const recentFiles = getRecentFiles();
  // console.log('recentFiles' ,recentFiles)

  return <RecentFiles recentFiles={recentFiles} />
}