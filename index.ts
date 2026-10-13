import { registerRootComponent } from 'expo';
import { I18nManager } from 'react-native';

// Layout direction is handled inside the app (Arabic/English switch live), so the OS must not mirror it.
try {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
} catch {}

// Defines the background step-goal task. TaskManager requires this at module load, before the app mounts.
import './src/logic/steps';

import App from './App';

registerRootComponent(App);
