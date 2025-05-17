"use client"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { useAuthStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [examinations, setExaminations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExams() {
      setLoading(true)
      const res = await fetch("/api/examinations")
      const data = await res.json()
      setExaminations(data)
      setLoading(false)
    }
    fetchExams()
  }, [])

  const handleManageExam = (examId) => {
    router.push(`/admin/manage/${examId}`)
  }

  const handleDeleteExam = async (examId) => {
    if (window.confirm("Are you sure you want to delete this examination series? This action cannot be undone.")) {
      const res = await fetch(`/api/examinations/${examId}`, { method: "DELETE" })
      if (res.ok) {
        setExaminations(examinations.filter(e => e.id !== examId))
      } else {
        alert("Failed to delete examination.")
      }
    }
  }

  return (
    <AuthGuard allowedRole="admin">
      <div className="container mx-auto">
        <DashboardHeader title="Admin Dashboard" userName={user?.name} department={user?.department} />

        <div className="mb-6">
          <h2 className="text-xl font-bold">Examination Series</h2>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading examinations...</div>
        ) : examinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examinations.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`p-4 ${exam.status === "complete" ? "bg-green-500" : "bg-blue-500"} text-white relative`}>
                  <h3 className="font-bold text-lg truncate">{exam.title}</h3>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="absolute top-4 right-4 text-white hover:text-red-200 transition-colors"
                    title="Delete examination"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-gray-700">
                        {new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}
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
