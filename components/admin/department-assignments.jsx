"use client"

import { useState, useEffect } from "react"
import { useAssignmentStore, departments } from "@/lib/data"
import { Check, RefreshCw, Download } from "lucide-react"

export default function DepartmentAssignments({ examId }) {
  const { getAssignmentDates, getAssignmentsByDate } = useAssignmentStore()
  const [loading, setLoading] = useState(true)
  const [assignmentDates, setAssignmentDates] = useState([])
  const [dateAssignments, setDateAssignments] = useState({})
  const [submittedDates, setSubmittedDates] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    // Load all assignment dates for this exam
    const dates = getAssignmentDates(examId)
    setAssignmentDates(dates)

    // Initialize submitted status for each date (in a real app, this would come from the database)
    const initialSubmitted = {}
    dates.forEach((date) => {
      initialSubmitted[date.toDateString()] = false
    })
    setSubmittedDates(initialSubmitted)

    // Load assignments for each date
    const allDateAssignments = {}
    dates.forEach((date) => {
      allDateAssignments[date.toDateString()] = getAssignmentsByDate(examId, date)
    })
    setDateAssignments(allDateAssignments)

    // Set first date as selected by default
    if (dates.length > 0) {
      setSelectedDate(dates[0])
    }

    setLoading(false)
  }, [examId, getAssignmentDates, getAssignmentsByDate])

  const handleSubmitDate = (dateStr) => {
    // In a real app, this would save to a database
    setSubmittedDates((prev) => ({
      ...prev,
      [dateStr]: true,
    }))

    // Simulate API call
    alert(`Assignments for ${new Date(dateStr).toLocaleDateString()} have been approved for room allocation.`)
  }

  const handleDownloadCSV = () => {
    // In a real app, this would generate and download a CSV file
    alert("Assignments downloaded as CSV")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin text-blue-500" size={24} />
      </div>
    )
  }

  return (
    <div>
      {/* Date Selection */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {assignmentDates.map((date) => (
          <button
            key={date.toDateString()}
            onClick={() => setSelectedDate(date)}
            className={`px-4 py-2 rounded ${
              selectedDate?.toDateString() === date.toDateString()
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {date.toLocaleDateString()}
          </button>
        ))}
      </div>

      {selectedDate && (
        <div>
          {/* Morning Session */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Morning Session</h3>
            <div className="space-y-4">
              {Object.entries(dateAssignments[selectedDate.toDateString()] || {}).map(([deptId, assignments]) => {
                const morningAssignments = assignments.filter((a) => a.session === "AM")
                if (morningAssignments.length === 0) return null

                return (
                  <div key={deptId} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">{departments[deptId]}</h4>
                    <div className="space-y-2">
                      {morningAssignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between bg-white p-2 rounded">
                          <div>
                            <span className="font-medium">{assignment.name}</span>
                            <span className="text-gray-600 ml-2">({assignment.designation})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Afternoon Session */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Afternoon Session</h3>
            <div className="space-y-4">
              {Object.entries(dateAssignments[selectedDate.toDateString()] || {}).map(([deptId, assignments]) => {
                const afternoonAssignments = assignments.filter((a) => a.session === "PM")
                if (afternoonAssignments.length === 0) return null

                return (
                  <div key={deptId} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">{departments[deptId]}</h4>
                    <div className="space-y-2">
                      {afternoonAssignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between bg-white p-2 rounded">
                          <div>
                            <span className="font-medium">{assignment.name}</span>
                            <span className="text-gray-600 ml-2">({assignment.designation})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <Download className="mr-2" size={18} />
              Download CSV
            </button>

            {!submittedDates[selectedDate.toDateString()] && (
              <button
                onClick={() => handleSubmitDate(selectedDate.toDateString())}
                className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                <Check className="mr-2" size={18} />
                Submit for Room Allocation
              </button>
            )}
          </div>

          {submittedDates[selectedDate.toDateString()] && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
              <div className="flex items-center">
                <Check className="mr-2" size={18} />
                <span>Submitted for room allocation</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
