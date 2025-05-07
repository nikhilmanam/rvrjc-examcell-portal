"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Admin", path: "/admin/login" },
    { name: "Employee", path: "/employee/login" },
    { name: "Coordinator", path: "/coordinator/login" },
    { name: "Exam Section", path: "/exam-section/login" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <nav className="bg-[#1a237e]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center">
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`px-6 py-3 text-white font-medium transition-colors duration-200
                  ${pathname === item.path 
                    ? 'bg-white/20' 
                    : 'hover:bg-white/10'}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
