import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../index.css'
import { ClientProviders } from '../components/providers/client-providers'
import { HydrationProvider } from '../components/providers/hydration-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fluyt Comercial',
  description: 'Sistema de gestão comercial para móveis planejados',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <HydrationProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </HydrationProvider>
      </body>
    </html>
  )
}