import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '创业决策引擎 - Founder Decision Engine',
  description: '基于YC和中文投资视角的创业想法评估工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
}
