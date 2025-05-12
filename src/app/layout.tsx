import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '¿TIENES GASTOS FANTASMAS?',
  description: 'Experiencia fotográfica interactiva con IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <div className="vertical-screen bg-[var(--background-color)]">
          {children}
        </div>
      </body>
    </html>
  );
}