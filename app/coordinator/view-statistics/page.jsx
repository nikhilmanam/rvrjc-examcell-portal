"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Download } from "lucide-react"

export default function ViewStatistics() {
  const router = useRouter()
  const [month, setMonth] = useState("April")
  const [year, setYear] = useState("2025")

  const handleExport = () => {
    // In a real app, this would generate and download a CSV file
    alert("Statistics exported as CSV")
  }

  return (
    <div className="container mx-auto">
      <DashboardHeader
        title="Employee Assignment Statistics"
        userName="Dr. Coordinator"
        department="Computer Science Engineering"
      />

      <div className="mb-6 flex">
        <button
          onClick={() => router.push("/coordinator/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Monthly Statistics</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Month:</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded p-1">
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Year:</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded p-1">
                <option>2025</option>
                <option>2026</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
            >
              <Download className="mr-1" size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded mb-6">
          <p className="text-gray-600">
            Showing statistics for{" "}
            <span className="font-medium">
              {month} {year}
            </span>
            &nbsp;&nbsp;•&nbsp;&nbsp; Total Employees: <span className="font-medium">0</span>
            &nbsp;&nbsp;•&nbsp;&nbsp; Assigned Employees: <span className="font-medium">0</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-6 border text-left">Employee ID</th>
                <th className="py-3 px-6 border text-left">Name</th>
                <th className="py-3 px-6 border text-left">Designation</th>
                <th className="py-3 px-6 border text-center">Monthly Assignments</th>
                <th className="py-3 px-6 border text-center">Total Assignments</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 italic">
                  No employee data available for this month
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
