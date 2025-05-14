"use client"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { useAuthStore } from "@/lib/data"

export default function PastExams() {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [examDetails, setExamDetails] = useState(null)
  const { user } = useAuthStore()

  useEffect(() => {
    // Fetch completed examinations
    fetch("/api/examinations?status=complete")
      .then(res => res.json())
      .then(data => setExams(data))
  }, [])

  const handleExamSelect = async (examId) => {
    // Fetch detailed information for the selected exam
    const [examData, allocationsData, staffData] = await Promise.all([
      fetch(`/api/examinations/${examId}`).then(res => res.json()),
      fetch(`/api/allocations/exam/${examId}`).then(res => res.json()),
      fetch(`/api/assignments/exam/${examId}`).then(res => res.json())
    ])

    setExamDetails({
      ...examData,
      allocations: allocationsData,
      staff: staffData
    })
    setSelectedExam(examId)
  }

  const handleDownload = (type) => {
    if (!examDetails) return

    let content = []
    let filename = ""

    switch (type) {
      case "allocations":
        content = [
          ["Date", "Session", "Room", "Department", "Course", "Students"],
          ...examDetails.allocations.map(a => [
            new Date(a.date).toLocaleDateString(),
            a.session,
            a.room_number,
            a.department,
            a.course,
            a.student_count
          ])
        ]
        filename = `exam_${examDetails.id}_allocations.csv`
        break

      case "staff":
        content = [
          ["Date", "Session", "Department", "Employee Name", "Designation"],
          ...examDetails.staff.map(s => [
            new Date(s.date).toLocaleDateString(),
            s.session,
            s.department,
            s.employee_name,
            s.designation
          ])
        ]
        filename = `exam_${examDetails.id}_staff.csv`
        break

      case "summary":
        content = [
          ["Exam Title", examDetails.title],
          ["Start Date", new Date(examDetails.start_date).toLocaleDateString()],
          ["End Date", new Date(examDetails.end_date).toLocaleDateString()],
          ["Total Rooms Used", examDetails.allocations.length],
          ["Total Staff Assigned", examDetails.staff.length],
          ["Total Students", examDetails.allocations.reduce((sum, a) => sum + a.student_count, 0)]
        ]
        filename = `exam_${examDetails.id}_summary.csv`
        break
    }

    // Create and download CSV
    const csvContent = content.map(row => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-8">
      <DashboardHeader
        title="Past Examinations"
        userName={user?.name}
        department={user?.department}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Past Exams List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Completed Examinations</h2>
          <div className="space-y-2">
            {exams.map(exam => (
              <button
                key={exam.id}
                onClick={() => handleExamSelect(exam.id)}
                className={`w-full text-left p-3 rounded ${
                  selectedExam === exam.id
                    ? "bg-blue-100 border-blue-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="font-medium">{exam.title}</div>
                <div className="text-sm text-gray-600">
                  {new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Exam Details */}
        {examDetails && (
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{examDetails.title}</h2>
                <div className="space-x-2">
                  <button
                    onClick={() => handleDownload("summary")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                  >
                    <Download className="mr-2" size={18} />
                    Summary
                  </button>
                  <button
                    onClick={() => handleDownload("allocations")}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
                  >
                    <Download className="mr-2" size={18} />
                    Allocations
                  </button>
                  <button
                    onClick={() => handleDownload("staff")}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center"
                  >
                    <Download className="mr-2" size={18} />
                    Staff List
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Date Range</div>
                  <div className="font-medium">
                    {new Date(examDetails.start_date).toLocaleDateString()} - {new Date(examDetails.end_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Total Rooms</div>
                  <div className="font-medium">{examDetails.allocations.length}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Total Staff</div>
                  <div className="font-medium">{examDetails.staff.length}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Total Students</div>
                  <div className="font-medium">
                    {examDetails.allocations.reduce((sum, a) => sum + a.student_count, 0)}
                  </div>
                </div>
              </div>

              {/* Room Allocations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Room Allocations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border text-left">Date</th>
                        <th className="py-2 px-4 border text-left">Session</th>
                        <th className="py-2 px-4 border text-left">Room</th>
                        <th className="py-2 px-4 border text-left">Department</th>
                        <th className="py-2 px-4 border text-left">Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examDetails.allocations.map((alloc, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4 border">
                            {new Date(alloc.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 border">{alloc.session}</td>
                          <td className="py-2 px-4 border">{alloc.room_number}</td>
                          <td className="py-2 px-4 border">{alloc.department}</td>
                          <td className="py-2 px-4 border">{alloc.student_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Staff Assignments */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Staff Assignments</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border text-left">Date</th>
                        <th className="py-2 px-4 border text-left">Session</th>
                        <th className="py-2 px-4 border text-left">Department</th>
                        <th className="py-2 px-4 border text-left">Employee</th>
                        <th className="py-2 px-4 border text-left">Designation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examDetails.staff.map((staff, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4 border">
                            {new Date(staff.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 border">{staff.session}</td>
                          <td className="py-2 px-4 border">{staff.department}</td>
                          <td className="py-2 px-4 border">{staff.employee_name}</td>
                          <td className="py-2 px-4 border">{staff.designation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 