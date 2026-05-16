import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vila Focolare — Gestão do Cuidado',
  description: 'Gestão do cuidado, rotina e segurança dos moradores — Vila Focolare · Igarassu-PE',
  icons: {
    icon: '/logo-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
