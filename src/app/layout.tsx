import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Villa Focolari — Gestão do Cuidado',
  description: 'Gestão do cuidado, rotina e segurança dos moradores — Villa Focolari · Igarassu-PE',
  icons: {
    icon: '/logo-villa-focolari.png',
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
