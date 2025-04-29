"use client"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { useExamStore, useAuthStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"

export default function AdminDashboard() {
  const router = useRouter()
  const { examinations } = useExamStore()
  const { user } = useAuthStore()

  const handleManageExam = (examId) => {
    router.push(`/admin/manage/${examId}`)
  }

  return (
    <AuthGuard allowedRole="admin">
      <div className="container mx-auto">
        <DashboardHeader title="Admin Dashboard" userName={user?.name} department={user?.department} />

        <div className="mb-6">
          <h2 className="text-xl font-bold">Examination Series</h2>
        </div>

        {examinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examinations.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`p-4 ${exam.status === "complete" ? "bg-green-500" : "bg-blue-500"} text-white`}>
                  <h3 className="font-bold text-lg truncate">{exam.title}</h3>
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

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleManageExam(exam.id)}
                      className="text-center bg-purple-500 hover:bg-purple-600 text-white py-2 rounded"
                    >
                      Employee Selection
                    </button>
                    <button
                      onClick={() => handleManageExam(exam.id)}
                      className="text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                    >
                      Room Allocation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No examination series created yet by the Exam Section.</p>
            <p className="text-gray-500 mt-2">Please wait for the Exam Section to create examination series.</p>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
