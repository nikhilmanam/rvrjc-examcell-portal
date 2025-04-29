"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { users } from "@/lib/data"
import { useAuthStore } from "@/lib/data"

export default function LoginForm({ userType = "Employee" }) {
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuthStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // Check if user exists and credentials match
    const user = Object.values(users).find((u) => {
      const roleMatch = u.role.toLowerCase() === userType.toLowerCase().replace(" ", "-")
      return u.id === id && roleMatch
    })

    if (user && user.password === password) {
      // Set authenticated user in store
      login(user)

      // Navigate to appropriate dashboard
      const dashboardPath = `/${userType.toLowerCase().replace(" ", "-")}/dashboard`
      router.push(dashboardPath)
    } else {
      setError("Invalid credentials. Please try again.")
    }
  }

  const handleDownload = () => {
    // In a real app, this would download the room allocation
    alert("Room allocation download functionality will be implemented with backend integration")
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
                onChange={(e) => setId(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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

      {userType === "Employee" && (
        <div className="mt-8">
          <button
            onClick={handleDownload}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Download Room Allocation
          </button>
        </div>
      )}
    </div>
  )
}
