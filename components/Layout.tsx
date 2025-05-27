import { Inter } from 'next/font/google'
import Link from 'next/link'
import Header from './Header'
import { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className={inter.className}>
      <Header />
      <main className="container mx-auto p-4 min-h-screen">
        {title && (
          <h1 className="text-3xl font-bold mb-6">{title}</h1>
        )}
        {children}
      </main>
    
    </div>
  )
}
