import { auth } from "@/auth";
import PageUploadStrukClient from "@/components/pages/PageUploadStrukClient";
import { getAllLayouts } from "@/models/Layout";
import { getSettingByUserId } from "@/models/Settings";
import { SettingsData } from "@/types/Settings";
import { Layout } from "@prisma/client";
import { Suspense } from "react";

export default async function App() {
  
  const session = await auth();
  
  let settings = undefined
  let layoutData: Layout[] = [];
  if(session) {
    layoutData = await getAllLayouts(); 
    settings = await getSettingByUserId();
  }
  const settingsData = settings ? settings.data : null;

  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Sedang mengambil data dari database...</p>
        </div>}>
      <PageUploadStrukClient settings={settingsData as SettingsData | null} layoutData={layoutData} />
    </Suspense>
  );
}