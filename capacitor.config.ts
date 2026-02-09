import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tictactoe.last3moves',
  appName: 'Tic Tac Toe',
  webDir: 'dist/tic-tac-toe/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
