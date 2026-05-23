import { auth } from "@/auth";
import PageSettingsClient from "@/components/pages/PageSettingsClient";
import { DEFAULT_SETTINGS_FIRST_LOGIN } from "@/lib/constanta";
import { getSettingByUserId } from "@/models/Settings";
import { SettingsData } from "@/types/Settings";
import { Suspense } from "react";

export default async function Page() {
  const session = await auth();
  
  let settings = undefined
  if(session) {
    settings = await getSettingByUserId();
  }

  const initialData = (
    settings?.data 
      ? (settings.data as unknown as SettingsData) 
      : DEFAULT_SETTINGS_FIRST_LOGIN
  ) as SettingsData;

  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Sedang mengambil data dari database...</p>
        </div>}>
      <PageSettingsClient initialData={initialData} />
    </Suspense>
  );
}