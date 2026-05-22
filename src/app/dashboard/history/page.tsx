import { auth } from '@/auth';
import PageHistoryClient from '@/components/pages/PageHistoryClient';
import { getSettingByUserId } from '@/models/Settings';
import { SettingsData } from '@/types/Settings';

const App: React.FC = async () => {
  const session = await auth();
  
  let settings = null
  if(session) {
    settings = await getSettingByUserId();
  }
  const settingsData = settings ? settings.data : null;

  return (
    <PageHistoryClient settingsData={settingsData as SettingsData | null} />
  )
};

export default App;