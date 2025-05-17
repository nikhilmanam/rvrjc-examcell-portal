"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"

export default function ViewRequirementsModal({ onClose, examId, department }) {
  const [requirementsData, setRequirementsData] = useState({
    department: department,
    totalRequired: 0,
    lastUpdated: new Date().toLocaleString(),
    schedule: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRequirements() {
      setLoading(true)
      try {
        // Get department ID from name
        const deptRes = await fetch('/api/departments')
        const departments = await deptRes.json()
        const dept = departments.find(d => d.name === department)
        if (!dept) return

        // Get requirements for this exam and department
        const reqRes = await fetch(`/api/requirements?exam_id=${examId}`)
        const requirements = await reqRes.json()

    // Filter requirements for this department
        const deptRequirements = requirements.filter(r => r.department_id === dept.id)
        
    let totalRequired = 0
    const schedule = []

        deptRequirements.forEach((req) => {
          const morningCount = req.morning || 0
          const afternoonCount = req.afternoon || 0
        totalRequired += morningCount + afternoonCount

        schedule.push({
            date: new Date(req.date).toLocaleDateString(),
          amSession: morningCount,
          pmSession: afternoonCount,
        })
    })

    setRequirementsData({
      department,
      totalRequired,
      lastUpdated: new Date().toLocaleString(),
          schedule: schedule.sort((a, b) => new Date(a.date) - new Date(b.date)),
    })
      } catch (error) {
        console.error('Error fetching requirements:', error)
      }
      setLoading(false)
    }
    fetchRequirements()
  }, [examId, department])

  const handleDownload = () => {
    // Generate CSV content
    const headers = ["Date", "AM Session", "PM Session", "Total"]
    const rows = requirementsData.schedule.map(day => [
      day.date,
      day.amSession,
      day.pmSession,
      day.amSession + day.pmSession
    ])
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `requirements_${examId}_${department}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">Loading requirements...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{department} - Invigilator Requirements</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
            >
              <Download className="mr-1" size={16} />
              Download
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded mb-6 flex justify-between items-center">
            <div>
              <p className="text-gray-600">Last Updated: {requirementsData.lastUpdated}</p>
            </div>
            <div>
              <p className="text-gray-600">
                Total Invigilators Required: <span className="font-bold">{requirementsData.totalRequired}</span>
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 border-l-4 border-blue-500 pl-3">Department Overview</h3>
            <div className="bg-white rounded border overflow-hidden">
              <div className="grid grid-cols-2 gap-4 p-6">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Department</p>
                  <p className="text-3xl font-bold">{department}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Total Invigilators Required</p>
                  <p className="text-3xl font-bold text-purple-600">{requirementsData.totalRequired}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 border-l-4 border-blue-500 pl-3">Detailed Schedule</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-6 border text-left">Date</th>
                    <th className="py-3 px-6 border text-center">AM Session</th>
                    <th className="py-3 px-6 border text-center">PM Session</th>
                    <th className="py-3 px-6 border text-center">Daily Total</th>
                  </tr>
                </thead>
                <tbody>
                  {requirementsData.schedule.length > 0 ? (
                    requirementsData.schedule.map((day, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-6 border">{day.date}</td>
                        <td className="py-3 px-6 border text-center">{day.amSession}</td>
                        <td className="py-3 px-6 border text-center">{day.pmSession}</td>
                        <td className="py-3 px-6 border text-center bg-blue-50">{day.amSession + day.pmSession}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-500">
                        No requirements found for your department
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
