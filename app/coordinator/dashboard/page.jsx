"use client"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { UserCheck, Calendar, BarChart2 } from "lucide-react"
import { useAuthStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"

export default function CoordinatorDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()

  const handleManageStaff = () => {
    router.push("/coordinator/manage-staff")
  }

  const handleViewRequirements = () => {
    router.push("/coordinator/view-requirements")
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-blue-600 mb-4">
                <UserCheck className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Manage Staff Availability</h3>
              <p className="text-gray-600 mb-6">Add and manage faculty members available for invigilation</p>
              <button
                onClick={handleManageStaff}
                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
              >
                Manage Employees
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-blue-600 mb-4">
                <Calendar className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Exam Section Data</h3>
              <p className="text-gray-600 mb-6">View and download the invigilator requirements for your department</p>
              <button
                onClick={handleViewRequirements}
                className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
              >
                View Requirements
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center text-center">
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
        </div>
      </div>
    </AuthGuard>
  )
}
