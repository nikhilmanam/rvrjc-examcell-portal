import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export const metadata = {
  title: "RVRJC - Examination Invigilation Management System",
  description: "R.V.R & J.C College of Engineering - Examination Management System",
  generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
