"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/data"
import { Download } from "lucide-react"

export default function LoginForm({ userType = "Employee" }) {
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [allocations, setAllocations] = useState([])
  const router = useRouter()
  const pathname = usePathname()
  const { login, user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    // Map path to role
    const pathRoleMap = {
      "/admin/login": "admin",
      "/employee/login": "employee",
      "/coordinator/login": "coordinator",
      "/exam-section/login": "exam-section",
    };
    const expectedRole = pathRoleMap[pathname];
    if (isAuthenticated && user && expectedRole && user.role !== expectedRole) {
      // If user is logged in but on a different login page, log them out
      logout();
      localStorage.clear(); // Clear persisted auth if using zustand persist
    }
  }, [pathname, isAuthenticated, user, logout]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") router.replace("/admin/dashboard")
      else if (user.role === "exam-section") router.replace("/exam-section/dashboard")
      else if (user.role === "coordinator") router.replace("/coordinator/dashboard")
      else if (user.role === "employee") router.replace("/employee/dashboard")
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: id, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }
      login(data.user)
      setError("")
      if (data.user.role === "employee") {
        // Fetch allocations for the logged-in employee
        const allocRes = await fetch(`/api/allocations/employee/${data.user.id}`)
        const allocData = await allocRes.json()
        setAllocations(allocData)
      } else if (data.user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (data.user.role === "exam-section") {
        router.push("/exam-section/dashboard")
      } else if (data.user.role === "coordinator") {
        router.push("/coordinator/dashboard")
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login")
    }
  }

  const handleDownloadAllocations = () => {
    // Create CSV content
    const headers = ["Date", "Session", "Room", "Exam Title", "Status"]
    const rows = allocations.map(alloc => [
      new Date(alloc.date).toLocaleDateString(),
      alloc.session,
      alloc.room,
      alloc.exam_title,
      alloc.status
    ])
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "my_allocations.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center bg-white p-8 rounded-lg shadow-md">
        <div className="mr-8">
          <Image src="/images/collegelogo.jpg" alt="College Logo" width={150} height={150} className="w-32 h-32" />
        </div>

        <div className="w-96">
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="id" className="block text-lg font-medium mb-2">
                {userType} id :
              </label>
              <input
                type="text"
                id="id"
                value={id}
                onChange={(e) => {
                  setId(e.target.value)
                  setError("")
                }}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-lg font-medium mb-2">
                Password :
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-500 text-white font-medium rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Show allocations if employee is logged in */}
      {allocations.length > 0 && (
        <div className="mt-8 w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Allocations</h2>
              <button
                onClick={handleDownloadAllocations}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              >
                <Download className="mr-2" size={18} />
                Download Allocations
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border text-left">Date</th>
                    <th className="py-2 px-4 border text-left">Session</th>
                    <th className="py-2 px-4 border text-left">Room</th>
                    <th className="py-2 px-4 border text-left">Exam Title</th>
                    <th className="py-2 px-4 border text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((alloc, index) => {
                    const isPast = new Date(alloc.date) < new Date()
                    return (
                      <tr 
                        key={index} 
                        className={`border-b ${isPast ? 'bg-gray-50 text-gray-500' : ''}`}
                      >
                        <td className="py-2 px-4 border">
                          {new Date(alloc.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border">{alloc.session}</td>
                        <td className="py-2 px-4 border">{alloc.room}</td>
                        <td className="py-2 px-4 border">{alloc.exam_title}</td>
                        <td className="py-2 px-4 border">
                          <span className={`px-2 py-1 rounded text-xs ${
                            isPast 
                              ? 'bg-gray-200 text-gray-600' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isPast ? 'Completed' : 'Upcoming'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
