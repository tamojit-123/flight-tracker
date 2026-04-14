import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import '@/styles/globals.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProviderWrapper } from '@/lib/queryClient';
import { Orbitron, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { aeroTheme } from '@/styles/theme';
import { AICopilot } from '@/components/ai/AICopilot';

const orbitron      = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });
const spaceGrotesk  = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata = {
  title: 'AEROTRACK — Global Flight Intelligence',
  description: 'Real-time worldwide flight tracking with AI copilot',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={aeroTheme} defaultColorScheme="dark">
          <Notifications position="top-right" zIndex={9999} />
          <QueryClientProviderWrapper>
            {children}
            <AICopilot />
          </QueryClientProviderWrapper>
        </MantineProvider>
      </body>
    </html>
  );
}