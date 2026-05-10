import PageStrukManualClient from "@/components/pages/PageStrukManualClient";
import { DefaultConfigLayout } from "@/lib/constanta";
import { getSettingByUserId } from "@/models/Settings";
import { SettingsData } from "@/types/Settings";

export default async function App() {

  const settings = await getSettingByUserId();
  const settingsData = settings ? settings.data : null;

  return (
    <PageStrukManualClient settings={settingsData as SettingsData | null} config={DefaultConfigLayout} configId={null} />
  );
}