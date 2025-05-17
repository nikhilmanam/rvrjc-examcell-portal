"use client"

import React, { useState, useEffect } from "react"
import { Download, Save, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InvigilatorRequirementsTable({ examId, dateRange }) {
  const router = useRouter()
  const [departments, setDepartments] = useState([])
  const [localRequirements, setLocalRequirements] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch departments from backend
  useEffect(() => {
    async function fetchDepartments() {
      const res = await fetch('/api/departments')
      const data = await res.json()
      setDepartments(data)
    }
    fetchDepartments()
  }, [])

  // Initialize requirements state with zeros
  useEffect(() => {
    if (departments.length > 0) {
      setLocalRequirements(
    dateRange.map((date) => ({
          date: new Date(date),
      departments: departments.map((dept) => ({
            id: dept.id,
            name: dept.name,
        morning: 0,
        afternoon: 0,
      })),
        }))
  )
    }
  }, [dateRange, departments])

  // Fetch requirements from backend
  useEffect(() => {
    async function fetchRequirements() {
      if (departments.length === 0) return
      setLoading(true)
      const res = await fetch(`/api/requirements?exam_id=${examId}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        // Map backend data to localRequirements structure
        const reqMap = {}
        data.forEach((row) => {
          // Use the date string as-is from the backend (assume YYYY-MM-DD)
          const dateStr = row.date
          if (!reqMap[dateStr]) reqMap[dateStr] = {}
          reqMap[dateStr][row.department_id] = {
            morning: row.morning,
            afternoon: row.afternoon,
          }
        })
        setLocalRequirements(
          dateRange.map((date) => {
            // Use local date string for matching
            const dateStr = date.toLocaleDateString('en-CA')
            return {
              date: new Date(date),
              departments: departments.map((dept) => {
                const req = reqMap[dateStr]?.[dept.id] || { morning: 0, afternoon: 0 }
                return {
                  id: dept.id,
                  name: dept.name,
                  morning: req.morning,
                  afternoon: req.afternoon,
                }
              }),
            }
          })
        )
    }
      setLoading(false)
    }
    fetchRequirements()
  }, [examId, dateRange, departments])

  const handleRequirementChange = (dateIndex, deptIndex, session, value) => {
    const newValue = Number.parseInt(value) || 0
    setLocalRequirements((prev) => {
      const newRequirements = [...prev]
      if (newRequirements[dateIndex] && newRequirements[dateIndex].departments[deptIndex]) {
        newRequirements[dateIndex].departments[deptIndex][session] = newValue
      }
      return newRequirements
    })
  }

  const handleSave = async () => {
    // Save all requirements to backend
    for (let dateIndex = 0; dateIndex < localRequirements.length; dateIndex++) {
      const day = localRequirements[dateIndex]
      const dateStr = day.date.toLocaleDateString('en-CA')
      for (let deptIndex = 0; deptIndex < day.departments.length; deptIndex++) {
        const dept = day.departments[deptIndex]
        await fetch("/api/requirements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exam_id: examId,
            department_id: dept.id,
            date: dateStr,
            morning: dept.morning,
            afternoon: dept.afternoon,
          }),
        })
      }
    }
    alert("Requirements saved successfully!")
  }

  const handleDownload = () => {
    // Generate CSV content
    const headers = ["Date", ...departments.flatMap(dept => [`${dept.name} (M)`, `${dept.name} (A)`])]
    const rows = localRequirements.map(day => {
      const date = formatDate(day.date)
      const values = day.departments.flatMap(dept => [dept.morning, dept.afternoon])
      return [date, ...values]
    })
    
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
    link.setAttribute("download", `requirements_${examId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      return "Invalid Date"
    }
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading || departments.length === 0) {
    return <div className="text-center py-8">Loading requirements...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/exam-section/dashboard")}
            className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back
          </button>
          <h2 className="text-xl font-bold">Invigilator Requirements</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
          >
            <Save className="mr-2" size={18} />
            Save Requirements
          </button>

          <button
            onClick={handleDownload}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            <Download className="mr-2" size={18} />
            Download CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border text-left">Date</th>
              {departments.map((dept) => (
                <React.Fragment key={dept.id}>
                  <th className="py-2 px-2 border text-center">{dept.name} (M)</th>
                  <th className="py-2 px-2 border text-center">{dept.name} (A)</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {localRequirements.map((day, dateIndex) => (
              <tr key={dateIndex} className="border-b">
                <td className="py-3 px-4 border font-medium">{formatDate(day.date)}</td>
                {day.departments.map((dept, deptIndex) => (
                  <React.Fragment key={`${dateIndex}-${deptIndex}`}>
                    <td className="py-1 px-1 border">
                      <input
                        type="number"
                        min="0"
                        value={dept.morning}
                        onChange={(e) => handleRequirementChange(dateIndex, deptIndex, "morning", e.target.value)}
                        className="w-full p-1 text-center border rounded"
                      />
                    </td>
                    <td className="py-1 px-1 border">
                      <input
                        type="number"
                        min="0"
                        value={dept.afternoon}
                        onChange={(e) => handleRequirementChange(dateIndex, deptIndex, "afternoon", e.target.value)}
                        className="w-full p-1 text-center border rounded"
                      />
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>M = Morning Session, A = Afternoon Session</p>
        <p>Enter the number of invigilators required for each department and session.</p>
      </div>
    </div>
  )
}
