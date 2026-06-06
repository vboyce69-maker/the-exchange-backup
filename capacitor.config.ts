import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.theexchange.app',
  appName: 'The Exchange',
  webDir: 'out'
  server: {
      url:'http://studio-3125423928-66163.web.app',
      cleartext: true
      }
};

export default config;
