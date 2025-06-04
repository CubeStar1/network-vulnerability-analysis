import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/global/theme-provider"
import QueryProvider from "@/components/global/query-provider";
import { Toaster } from "@/components/ui/toaster"
import { SimulationProvider } from '@/lib/contexts/simulation-context';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Network Monitoring',
  description: 'A modern platform for Network Monitoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full`}>
        <SimulationProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </QueryProvider>
        </SimulationProvider>
        <Toaster />
      </body>
    </html>
  )
}
