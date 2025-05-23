"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, Calendar, Building2 } from "lucide-react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DepartmentAssignments from "@/components/admin/department-assignments"
import RoomAllocation from "@/components/admin/room-allocation"
import { useAuthStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"

export default function ManageExam({ params }) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState("assignments")

  const examId = params.id
  const [exam, setExam] = useState(null)
  const [loadingExam, setLoadingExam] = useState(true)

  useEffect(() => {
    async function fetchExam() {
      setLoadingExam(true)
      const res = await fetch(`/api/examinations/${examId}`)
      if (res.ok) {
        setExam(await res.json())
      } else {
        setExam(null)
      }
      setLoadingExam(false)
    }
    if (examId) fetchExam()
  }, [examId])

  if (loadingExam) {
    return (
      <AuthGuard allowedRole="admin">
        <div className="container mx-auto p-6 text-center text-gray-600">
          Loading exam details...
        </div>
      </AuthGuard>
    )
  }

  if (!exam) {
    return (
      <AuthGuard allowedRole="admin">
        <div className="container mx-auto p-6">
          <div className="bg-red-100 p-4 rounded-md text-red-700">
            Examination not found. Please go back to the dashboard.
          </div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRole="admin">
      <div className="container mx-auto">
        <DashboardHeader title={exam.title} userName={user?.name} department={user?.department} />

        <div className="mb-6 flex">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Exam Details</h2>
            <div className="text-gray-600">
              {new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("assignments")}
              className={`flex items-center px-4 py-2 rounded ${
                activeTab === "assignments"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Users className="mr-2" size={18} />
              Employee Assignments
            </button>
            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex items-center px-4 py-2 rounded ${
                activeTab === "rooms"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Building2 className="mr-2" size={18} />
              Room Allocation
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "assignments" && <DepartmentAssignments examId={examId} />}
          {activeTab === "rooms" && <RoomAllocation examId={examId} />}
        </div>
      </div>
    </AuthGuard>
  )
}
