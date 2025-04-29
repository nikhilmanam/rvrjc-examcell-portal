"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, Calendar } from "lucide-react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DepartmentAssignments from "@/components/admin/department-assignments"
import RoomAllocation from "@/components/admin/room-allocation"
import { useAuthStore, useExamStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"

export default function ManageExam({ params }) {
  const router = useRouter()
  const { user } = useAuthStore()
  const { examinations } = useExamStore()
  const [activeTab, setActiveTab] = useState("assignments")

  const examId = params.id
  const exam = examinations.find((e) => e.id === examId)

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

        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Calendar className="mr-2 text-gray-500" size={18} />
            <span className="text-gray-700">
              {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center">
            <Users className="mr-2 text-gray-500" size={18} />
            <span className="text-gray-700">Sessions: Morning & Afternoon</span>
          </div>
        </div>

        <div className="mb-6 border-b">
          <div className="flex">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === "assignments"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("assignments")}
            >
              Department Assignments
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === "allocation"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("allocation")}
            >
              Room Allocation
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === "assignments" && <DepartmentAssignments examId={examId} />}
          {activeTab === "allocation" && <RoomAllocation examId={examId} />}
        </div>
      </div>
    </AuthGuard>
  )
}
