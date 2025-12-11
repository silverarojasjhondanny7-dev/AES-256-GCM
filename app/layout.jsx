import './globals.css'

export const metadata = {
  title: 'Sistema DNI Perú - Consulta Segura',
  description: 'Sistema de consulta y almacenamiento seguro de DNI con cifrado AES-256-GCM',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}