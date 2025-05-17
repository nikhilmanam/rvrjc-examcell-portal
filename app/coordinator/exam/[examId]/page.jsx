"use client"
import { useRouter, useParams } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { useAuthStore } from "@/lib/data"
import AuthGuard from "@/components/auth/auth-guard"
import { Calendar, UserCheck } from "lucide-react"
import { useEffect, useState } from "react"

export default function CoordinatorExamPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params?.examId
  const { user } = useAuthStore()

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

  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [departmentId, setDepartmentId] = useState(null)

  useEffect(() => {
    async function fetchRequirements() {
      setLoading(true)
      try {
        // Get department ID from name
        const deptRes = await fetch('/api/departments')
        const departments = await deptRes.json()
        const dept = departments.find(d => d.name === user?.department)
        if (!dept) {
          setLoading(false)
          return
        }
        setDepartmentId(dept.id)
        // Get requirements for this exam
        const reqRes = await fetch(`/api/requirements?exam_id=${examId}`)
        const allRequirements = await reqRes.json()
        // Filter for this department
        const deptRequirements = allRequirements.filter(r => r.department_id === dept.id)
        setRequirements(deptRequirements)
      } catch (error) {
        setRequirements([])
      }
      setLoading(false)
    }
    if (examId && user?.department) fetchRequirements()
  }, [examId, user?.department])

  const renderRequirements = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold mb-2 flex items-center"><Calendar className="mr-2" size={18} />Exam Requirements</h3>
          <p className="text-gray-700">Loading requirements...</p>
        </div>
      )
    }
    if (!requirements.length) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold mb-2 flex items-center"><Calendar className="mr-2" size={18} />Exam Requirements</h3>
          <p className="text-gray-700 mb-2">Department: <span className="font-semibold">{user?.department}</span></p>
          <p className="text-gray-700">No requirements found for this department.</p>
        </div>
      )
    }
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold mb-2 flex items-center"><Calendar className="mr-2" size={18} />Exam Requirements</h3>
        <p className="text-gray-700 mb-2">Department: <span className="font-semibold">{user?.department}</span></p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">Date</th>
                <th className="py-2 px-4 border text-center">Morning</th>
                <th className="py-2 px-4 border text-center">Afternoon</th>
                <th className="py-2 px-4 border text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {requirements.sort((a, b) => new Date(a.date) - new Date(b.date)).map((req, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 px-4 border">{new Date(req.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border text-center">{req.morning}</td>
                  <td className="py-2 px-4 border text-center">{req.afternoon}</td>
                  <td className="py-2 px-4 border text-center">{(req.morning || 0) + (req.afternoon || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (loadingExam) {
    return <div className="container mx-auto p-8 text-center text-gray-600">Loading exam details...</div>
  }

  if (!exam) {
    return <div className="container mx-auto p-8 text-center text-red-600">Exam not found.</div>
  }

  const handleManageStaff = () => {
    router.push(`/coordinator/manage-staff/${examId}`)
  }

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
          <p className="text-gray-600">{new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}</p>
        </div>
        {renderRequirements()}
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