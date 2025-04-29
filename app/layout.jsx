import "./globals.css"
import Header from "@/components/layout/header"

export const metadata = {
  title: "RVRJCAMS - Examination Invigilation Management System",
  description: "R.V.R & J.C Academic Management System",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow bg-[#f0f4f8] p-4">{children}</main>
      </body>
    </html>
  )
}
