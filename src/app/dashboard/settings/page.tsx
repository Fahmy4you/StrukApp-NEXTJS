import { auth } from "@/auth";
import PageSettingsClient from "@/components/pages/PageSettingsClient";
import { getSettingByUserId } from "@/models/Settings";
import { SettingsData } from "@/types/Settings";

export default async function Page() {
  const session = await auth();

  let settings = undefined
  if(session) {
    settings = await getSettingByUserId();
  }

  const initialData = settings?.data 
    ? (settings.data as unknown as SettingsData) 
    : undefined;

  return <PageSettingsClient initialData={initialData} />;
}