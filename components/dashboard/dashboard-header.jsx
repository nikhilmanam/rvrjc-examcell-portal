"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/data"
import { LogOut, User, Building2 } from "lucide-react"

export default function DashboardHeader({ title, userName, department }) {
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    // Clear authentication
    logout()
    // Redirect to home
    router.push("/")
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          {(userName || department) && (
            <div className="mt-3 flex gap-4">
              {userName && (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg text-blue-700">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{userName}</span>
                </div>
              )}
              {department && (
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg text-green-700">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{department}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
