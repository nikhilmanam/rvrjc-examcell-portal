"use client"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Plus, Trash2 } from "lucide-react"
import { useExamStore, useAuthStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"

export default function ExamSectionDashboard() {
  const router = useRouter()
  const { examinations, deleteExamination } = useExamStore()
  const { user } = useAuthStore()

  const handleCreateExam = () => {
    router.push("/exam-section/create-exam")
  }

  const handleManageExam = (examId) => {
    router.push(`/exam-section/manage/${examId}`)
  }

  const handleDeleteExam = (examId) => {
    if (window.confirm("Are you sure you want to delete this examination series? This action cannot be undone.")) {
      deleteExamination(examId)
    }
  }

  return (
    <AuthGuard allowedRole="exam-section">
      <div className="container mx-auto">
        <DashboardHeader title="Exam Section Dashboard" userName={user?.name} department={user?.department} />

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Examination Series</h2>
          <button
            onClick={handleCreateExam}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
          >
            <Plus className="mr-2" size={18} />
            Add Examination Series
          </button>
        </div>

        {examinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examinations.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`p-4 ${exam.status === "complete" ? "bg-green-500" : "bg-blue-500"} text-white relative`}>
                  <h3 className="font-bold text-lg truncate pr-8">{exam.title}</h3>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="absolute top-4 right-4 text-white hover:text-red-200 transition-colors"
                    title="Delete examination"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-gray-700">
                        {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="text-gray-700">Sessions: Morning & Afternoon</span>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center">
                    <div
                      className={`flex items-center ${exam.status === "complete" ? "text-green-500" : "text-amber-500"}`}
                    >
                      <span className="font-medium">{exam.status === "complete" ? "Completed" : "Not Completed"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleManageExam(exam.id)}
                    className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                  >
                    {exam.status === "complete" ? "View Details" : "Manage Requirements"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">No examination series created yet.</p>
            <button
              onClick={handleCreateExam}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded inline-flex items-center"
            >
              <Plus className="mr-2" size={18} />
              Create Your First Examination
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
