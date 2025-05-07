"use client"
import { useRouter, useParams } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { useExamStore, useAuthStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"
import { Calendar, UserCheck } from "lucide-react"

export default function CoordinatorExamPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params?.examId
  const { examinations } = useExamStore()
  const { user } = useAuthStore()

  const exam = examinations.find((e) => e.id === examId)

  if (!exam) {
    return <div className="container mx-auto p-8 text-center text-red-600">Exam not found.</div>
  }

  const handleManageStaff = () => {
    router.push(`/coordinator/manage-staff/${examId}`)
  }

  // Placeholder for requirements - replace with actual requirements logic if available
  const requirements = (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold mb-2 flex items-center"><Calendar className="mr-2" size={18} />Exam Requirements</h3>
      <p className="text-gray-700 mb-2">Department: <span className="font-semibold">{user?.department}</span></p>
      <p className="text-gray-700">(Requirements for this department will be shown here.)</p>
    </div>
  )

  return (
    <AuthGuard allowedRole="coordinator">
      <div className="container mx-auto">
        <DashboardHeader
          title={`Exam: ${exam.title}`}
          userName={user?.name}
          department={user?.department}
        />
        <div className="mb-6">
          <h2 className="text-xl font-bold">Exam Details</h2>
          <p className="text-gray-600">{new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</p>
        </div>
        {requirements}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
          <h3 className="text-lg font-bold mb-2 flex items-center"><UserCheck className="mr-2" size={18} />Manage Employees</h3>
          <p className="text-gray-700 mb-4">Add and manage faculty members available for invigilation for this exam.</p>
          <button
            onClick={handleManageStaff}
            className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white w-full max-w-xs"
          >
            Manage Employees
          </button>
        </div>
      </div>
    </AuthGuard>
  )
} 