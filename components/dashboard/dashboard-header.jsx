"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/data"

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
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50">
          Logout
        </button>
      </div>
      {(userName || department) && (
        <div className="mt-2 flex">
          {userName && <div className="bg-blue-100 px-3 py-1 rounded-md text-blue-800 mr-4">Emp Name: {userName}</div>}
          {department && <div className="bg-green-100 px-3 py-1 rounded-md text-green-800">Dept: {department}</div>}
        </div>
      )}
    </div>
  )
}
