import { auth } from "@/auth";
import PageStrukManualClient from "@/components/pages/PageStrukManualClient";
import { getAllLayouts } from "@/models/Layout";
import { getSettingByUserId } from "@/models/Settings";
import { SettingsData } from "@/types/Settings";
import { Layout } from "@prisma/client";

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
    <PageStrukManualClient layoutData={layoutData} settings={settingsData as SettingsData | null} />
  );
}