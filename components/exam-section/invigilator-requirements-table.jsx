"use client"

import React, { useState, useEffect } from "react"
import { Download, Save, ArrowLeft } from "lucide-react"
import { departments, useRequirementsStore } from "@/lib/data"
import { useRouter } from "next/navigation"

export default function InvigilatorRequirementsTable({ examId, dateRange }) {
  const router = useRouter()
  const { requirements, setRequirements } = useRequirementsStore()

  // Initialize requirements state with zeros
  const [localRequirements, setLocalRequirements] = useState(
    dateRange.map((date) => ({
      date,
      departments: departments.map((dept) => ({
        name: dept,
        morning: 0,
        afternoon: 0,
      })),
    })),
  )

  // Load existing requirements if available
  useEffect(() => {
    if (requirements[examId]) {
      setLocalRequirements(requirements[examId])
    }
  }, [examId, requirements])

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

  const handleSave = () => {
    // Save requirements to the store
    setRequirements(examId, localRequirements)
    alert("Requirements saved successfully!")
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a CSV file
    alert("Requirements downloaded as CSV")
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
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
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border text-left">Date</th>
              {departments.map((dept) => (
                <th key={dept} className="py-3 px-4 border text-center" colSpan={2}>
                  {dept}
                </th>
              ))}
            </tr>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border"></th>
              {departments.map((dept) => (
                <React.Fragment key={`${dept}-sessions`}>
                  <th className="py-2 px-2 border text-center w-12">M</th>
                  <th className="py-2 px-2 border text-center w-12">A</th>
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
