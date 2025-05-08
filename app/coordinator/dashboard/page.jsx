"use client"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { UserCheck, Calendar, BarChart2 } from "lucide-react"
import { useAuthStore, useExamStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"

export default function CoordinatorDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { examinations } = useExamStore()

  const handleManageStaff = (examId) => {
    router.push(`/coordinator/manage-staff?examId=${examId}`)
  }

  const handleViewRequirements = (examId) => {
    router.push(`/coordinator/exam/${examId}`)
  }

  const handleViewStatistics = () => {
    router.push("/coordinator/view-statistics")
  }

  return (
    <AuthGuard allowedRole="coordinator">
      <div className="container mx-auto">
        <DashboardHeader
          title={`Coordinator Panel - ${user?.department}`}
          userName={user?.name}
          department={user?.department}
        />

        <div className="mb-6">
          <h2 className="text-xl font-bold">Examination Series</h2>
        </div>

        {examinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {examinations.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
                <p className="text-gray-600 mb-4">{new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</p>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => handleManageStaff(exam.id)}
                    className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white w-full"
                  >
                    Manage Employees
                  </button>
                  <button
                    onClick={() => handleViewRequirements(exam.id)}
                    className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white w-full"
                  >
                    Exam Requirements
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
            <p className="text-gray-500">No examination series created yet by the Exam Section.</p>
          </div>
        )}

        {/* Employee Stats Section */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center mt-8">
          <div className="text-blue-600 mb-4">
            <BarChart2 className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold mb-2">Employee Assignment Stats</h3>
          <p className="text-gray-600 mb-6">View monthly invigilation assignment counts for department employees</p>
          <button
            onClick={handleViewStatistics}
            className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
          >
            View Statistics
          </button>
        </div>
      </div>
    </AuthGuard>
  )
}
