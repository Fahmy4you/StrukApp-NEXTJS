import PageSettingsClient from "@/components/pages/PageSettingsClient";
import { getSettingByUserId } from "@/models/Settings";
import { SettingsData } from "@/types/Settings";

export default async function Page() {
  const settings = await getSettingByUserId(); // Ambil data dari tabel Settings

  const initialData = settings?.data 
    ? (settings.data as unknown as SettingsData) 
    : undefined;

  return <PageSettingsClient initialData={initialData} />;
}