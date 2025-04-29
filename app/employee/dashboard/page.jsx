"use client"

import { useState } from "react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Download } from "lucide-react"
import { useAuthStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"

export default function EmployeeDashboard() {
  const { user } = useAuthStore()
  // Start with an empty schedule - no pre-existing allocations
  const [schedule, setSchedule] = useState([])

  const handleDownload = () => {
    // In a real app, this would generate and download a CSV file
    alert("Schedule downloaded as CSV")
  }

  return (
    <AuthGuard allowedRole="employee">
      <div className="container mx-auto">
        <DashboardHeader title="Employee Dashboard" userName={user?.name} department={user?.department} />

        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Invigilation Schedule</h2>
            <button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
            >
              <Download className="mr-2" size={18} />
              Download Room Allocation
            </button>
          </div>

          {schedule.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border text-left">Date</th>
                    <th className="py-3 px-4 border text-left">Session</th>
                    <th className="py-3 px-4 border text-left">Block</th>
                    <th className="py-3 px-4 border text-left">Room</th>
                    <th className="py-3 px-4 border text-left">Room Type</th>
                    <th className="py-3 px-4 border text-left">Examination</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((duty) => (
                    <tr key={duty.id} className="border-b">
                      <td className="py-3 px-4 border">{new Date(duty.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 border">
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">{duty.session}</span>
                      </td>
                      <td className="py-3 px-4 border">{duty.block}</td>
                      <td className="py-3 px-4 border">{duty.roomNumber}</td>
                      <td className="py-3 px-4 border">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            duty.roomType === "Drawing Hall"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {duty.roomType}
                        </span>
                      </td>
                      <td className="py-3 px-4 border">{duty.examTitle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>You have no invigilation duties assigned yet.</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
