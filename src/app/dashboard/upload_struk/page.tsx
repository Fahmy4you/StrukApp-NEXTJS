import PageUploadStrukClient from "@/components/pages/PageUploadStrukClient";
import { DefaultConfigLayout } from "@/lib/constanta";
import { getAllLayouts } from "@/models/Layout";
import { getSettingByUserId } from "@/models/Settings";
import { SettingsData } from "@/types/Settings";

export default async function App() {

  const settings = await getSettingByUserId();
  const settingsData = settings ? settings.data : null;
  const layoutData = await getAllLayouts(); 

  return (
    <PageUploadStrukClient settings={settingsData as SettingsData | null} layoutData={layoutData} />
  );
}