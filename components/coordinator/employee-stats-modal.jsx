"use client"

import { useState } from "react"
import { Download, X } from "lucide-react"

export default function EmployeeStatsModal({ onClose }) {
  const [month, setMonth] = useState("April")
  const [year, setYear] = useState("2025")

  // In a real app, this would be fetched from an API
  const employeeStats = {
    totalEmployees: 0,
    assignedEmployees: 0,
    employees: [],
  }

  const handleExport = () => {
    // In a real app, this would generate and download a CSV file
    alert("Statistics exported as CSV")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Employee Assignment Statistics</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Month:</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded p-1">
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

            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded mb-6">
            <p className="text-gray-600">
              Showing statistics for{" "}
              <span className="font-medium">
                {month} {year}
              </span>
              &nbsp;&nbsp;•&nbsp;&nbsp; Total Employees:{" "}
              <span className="font-medium">{employeeStats.totalEmployees}</span>
              &nbsp;&nbsp;•&nbsp;&nbsp; Assigned Employees:{" "}
              <span className="font-medium">{employeeStats.assignedEmployees}</span>
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
                {employeeStats.employees.length > 0 ? (
                  employeeStats.employees.map((emp) => (
                    <tr key={emp.id} className="border-b">
                      <td className="py-3 px-6 border">{emp.id}</td>
                      <td className="py-3 px-6 border">{emp.name}</td>
                      <td className="py-3 px-6 border">{emp.designation}</td>
                      <td className="py-3 px-6 border text-center">{emp.monthlyAssignments}</td>
                      <td className="py-3 px-6 border text-center">{emp.totalAssignments}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 italic">
                      No employee data available for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-center">
            <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
