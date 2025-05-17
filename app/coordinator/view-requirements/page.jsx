"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { ArrowLeft } from "lucide-react"
import { useAuthStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"
import ViewRequirementsModal from "@/components/coordinator/view-requirements-modal"

export default function ViewRequirements() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [examinations, setExaminations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handleExamSelect = (exam) => {
    setSelectedExam(exam)
    setIsModalOpen(true)
  }

  return (
    <AuthGuard allowedRole="coordinator">
      <div className="container mx-auto">
        <DashboardHeader title="Exam Section Data - Requirements" userName={user?.name} department={user?.department} />

        <div className="mb-6 flex">
          <button
            onClick={() => router.push("/coordinator/dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Current Examination Series</h2>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading examinations...</div>
          ) : examinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {examinations.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-blue-600 text-white p-6 rounded-lg cursor-pointer hover:bg-blue-700"
                  onClick={() => handleExamSelect(exam)}
                >
                  <h3 className="text-xl font-bold mb-4 text-center">{exam.title}</h3>
                  <p className="text-center mb-2">Room and Staff Allocation</p>
                  <button className="w-full bg-white text-blue-600 hover:bg-blue-100 mt-4 px-4 py-2 rounded font-medium">
                    View Requirements
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No examination series created yet by the Exam Section.</p>
            </div>
          )}
        </div>

        {isModalOpen && selectedExam && (
          <ViewRequirementsModal
            onClose={() => setIsModalOpen(false)}
            examId={selectedExam.id}
            department={user?.department}
          />
        )}
      </div>
    </AuthGuard>
  )
}
