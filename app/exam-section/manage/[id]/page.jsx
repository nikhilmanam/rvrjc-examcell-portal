"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import ExamHeader from "@/components/dashboard/exam-header"
import { useExamStore } from "@/lib/data"
import InvigilatorRequirementsTable from "@/components/exam-section/invigilator-requirements-table"
import RoomManagement from "@/components/exam-section/room-management"
import { ArrowLeft } from "lucide-react"

export default function ManageExamPage({ params }) {
  const router = useRouter()
  const examId = params.id
  const { examinations } = useExamStore()

  const [exam, setExam] = useState(null)
  const [activeTab, setActiveTab] = useState("requirements")
  const [dateRange, setDateRange] = useState([])

  useEffect(() => {
    // Find the examination by ID
    const foundExam = examinations.find((e) => e.id === examId)

    if (foundExam) {
      setExam(foundExam)

      // Generate date range between start and end dates
      if (foundExam.startDate && foundExam.endDate) {
        const start = new Date(foundExam.startDate)
        const end = new Date(foundExam.endDate)
        const dates = []

        const currentDate = new Date(start)
        while (currentDate <= end) {
          dates.push(new Date(currentDate))
          currentDate.setDate(currentDate.getDate() + 1)
        }

        setDateRange(dates)
      }
    } else {
      // If exam not found, redirect to dashboard
      router.push("/exam-section/dashboard")
    }
  }, [examId, examinations, router])

  if (!exam) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  return (
    <div className="container mx-auto">
      <DashboardHeader title="Manage Examination" userName="Exam Admin" department="Examination" />

      <div className="mb-6 flex">
        <button
          onClick={() => router.push("/exam-section/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to Dashboard
        </button>
      </div>

      <ExamHeader examTitle={exam.title} subtitle="Room and Staff Allocation" />

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "requirements" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("requirements")}
          >
            Invigilator Requirements
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "rooms" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("rooms")}
          >
            Room Management
          </button>
        </div>

        <div className="p-4">
          {activeTab === "requirements" && <InvigilatorRequirementsTable examId={examId} dateRange={dateRange} />}
          {activeTab === "rooms" && <RoomManagement examId={examId} />}
        </div>
      </div>
    </div>
  )
}
