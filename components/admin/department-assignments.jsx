"use client"

import { useState, useEffect } from "react"
import { useAssignmentStore, departments } from "@/lib/data"
import { Check, RefreshCw } from "lucide-react"

export default function DepartmentAssignments({ examId }) {
  const { getAssignmentDates, getAssignmentsByDate } = useAssignmentStore()
  const [loading, setLoading] = useState(true)
  const [assignmentDates, setAssignmentDates] = useState([])
  const [dateAssignments, setDateAssignments] = useState({})
  const [submittedDates, setSubmittedDates] = useState({})

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
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span>Loading assignments...</span>
      </div>
    )
  }

  if (assignmentDates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">No dates with assignments yet.</p>
        <p className="text-gray-500">Wait for coordinators to assign employees.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Department Assignments</h2>
        <button onClick={handleDownloadCSV} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Download CSV
        </button>
      </div>

      {assignmentDates.map((date) => {
        const dateStr = date.toDateString()
        const assignments = dateAssignments[dateStr] || {}
        const hasAssignments = Object.values(assignments).some((arr) => arr.length > 0)

        if (!hasAssignments) return null

        return (
          <div key={dateStr} className="mb-8 border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">{date.toLocaleDateString()}</h3>
              <div>
                {submittedDates[dateStr] ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                    <Check size={16} className="mr-1" />
                    Approved
                  </span>
                ) : (
                  <button
                    onClick={() => handleSubmitDate(dateStr)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Submit Final Approval
                  </button>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Morning Session */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-amber-100 p-3">
                    <h4 className="font-medium">Morning Session (AM)</h4>
                  </div>
                  <div className="p-3">
                    {departments.map((dept) => {
                      const deptAssignments = assignments[dept] || []
                      const morningAssignments = deptAssignments.filter((a) => a.session === "AM")

                      if (morningAssignments.length === 0) return null

                      return (
                        <div key={`${dept}-AM`} className="mb-4 last:mb-0">
                          <h5 className="font-medium text-sm mb-2 bg-gray-100 p-2 rounded">{dept}</h5>
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="py-2 px-3 text-left">ID</th>
                                <th className="py-2 px-3 text-left">Name</th>
                                <th className="py-2 px-3 text-left">Designation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {morningAssignments.map((employee) => (
                                <tr key={`${employee.id}-AM`} className="border-t">
                                  <td className="py-2 px-3">{employee.id}</td>
                                  <td className="py-2 px-3">{employee.name}</td>
                                  <td className="py-2 px-3">{employee.designation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    })}
                    {!departments.some((dept) => {
                      const deptAssignments = assignments[dept] || []
                      return deptAssignments.some((a) => a.session === "AM")
                    }) && <p className="text-gray-500 py-2">No employees assigned for morning session</p>}
                  </div>
                </div>

                {/* Afternoon Session */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-indigo-100 p-3">
                    <h4 className="font-medium">Afternoon Session (PM)</h4>
                  </div>
                  <div className="p-3">
                    {departments.map((dept) => {
                      const deptAssignments = assignments[dept] || []
                      const afternoonAssignments = deptAssignments.filter((a) => a.session === "PM")

                      if (afternoonAssignments.length === 0) return null

                      return (
                        <div key={`${dept}-PM`} className="mb-4 last:mb-0">
                          <h5 className="font-medium text-sm mb-2 bg-gray-100 p-2 rounded">{dept}</h5>
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="py-2 px-3 text-left">ID</th>
                                <th className="py-2 px-3 text-left">Name</th>
                                <th className="py-2 px-3 text-left">Designation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {afternoonAssignments.map((employee) => (
                                <tr key={`${employee.id}-PM`} className="border-t">
                                  <td className="py-2 px-3">{employee.id}</td>
                                  <td className="py-2 px-3">{employee.name}</td>
                                  <td className="py-2 px-3">{employee.designation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    })}
                    {!departments.some((dept) => {
                      const deptAssignments = assignments[dept] || []
                      return deptAssignments.some((a) => a.session === "PM")
                    }) && <p className="text-gray-500 py-2">No employees assigned for afternoon session</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
