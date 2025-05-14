"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Calendar, Clock, UserPlus, Trash2 } from "lucide-react"
import { useAuthStore, useAssignmentStore, useExamStore } from "@/lib/data"
import { isEmployeeChangeAllowed } from "@/lib/utils"
import { useDepartmentEmployees } from "@/lib/hooks"

export default function ManageStaff() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const examId = searchParams.get('examId')
  const { user } = useAuthStore()
  const { examinations } = useExamStore()
  const { addAssignment, getAssignmentsByDepartment, removeAssignment } = useAssignmentStore()
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSession, setSelectedSession] = useState("AM")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [originalEmployees, setOriginalEmployees] = useState([]) // Track original state
  const [hasChanges, setHasChanges] = useState(false) // Track if changes were made
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  // Map department name to departmentId (adjust as needed)
  const departmentMap = {
    CSE: 1, CSBS: 2, "CSE(DS)": 3, "CSE(AILML)": 4, "CSE(IOT)": 5, IT: 6, ECE: 7, EEE: 8, CHE: 9, CIVIL: 10, MECH: 11, MCA: 12, MBA: 13
  }
  const userDepartment = user?.department || "CSE"
  const departmentId = departmentMap[userDepartment] || 1
  const departmentEmployees = useDepartmentEmployees(departmentId)

  // Get exam details
  const exam = examinations.find((e) => e.id === examId)
  const examDates = exam ? getExamDates(exam.startDate, exam.endDate) : []

  // Load previously saved employees when component mounts
  useEffect(() => {
    if (!examId) return
    setIsLoading(true)
    try {
      // Get all assignments for this department and exam
      const savedAssignments = getAssignmentsByDepartment(examId, userDepartment)
      if (savedAssignments && savedAssignments.length > 0) {
        setSelectedEmployees(savedAssignments)
        setOriginalEmployees(savedAssignments) // Store original state
      }
    } catch (error) {
      console.error("Error loading saved assignments:", error)
    } finally {
      setIsLoading(false)
    }
  }, [examId, userDepartment, getAssignmentsByDepartment])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Set first date as selected by default
  useEffect(() => {
    if (examDates.length > 0 && !selectedDate) {
      setSelectedDate(examDates[0])
    }
  }, [examDates, selectedDate])

  // Check for changes whenever selectedEmployees changes
  useEffect(() => {
    const hasChanges = JSON.stringify(selectedEmployees) !== JSON.stringify(originalEmployees)
    setHasChanges(hasChanges)
  }, [selectedEmployees, originalEmployees])

  const handleAddEmployee = () => {
    if (!selectedEmployee || !selectedDate || !examId) return

    // Find the employee in the department
    const employee = departmentEmployees.find((emp) => emp.id === selectedEmployee)

    if (!employee) return

    // Check if employee is already assigned for this date and session
    const isAlreadyAssigned = selectedEmployees.some(
      (emp) => emp.id === selectedEmployee && emp.date === selectedDate && emp.session === selectedSession,
    )

    if (isAlreadyAssigned) {
      alert("This employee is already assigned for this date and session.")
      return
    }

    // Check if changes are allowed (2 hours before exam)
    if (!isEmployeeChangeAllowed(selectedDate, selectedSession)) {
      alert("Changes cannot be made within 2 hours of the examination time.")
      return
    }

    // Create a unique ID for this assignment
    const assignmentId = `${selectedEmployee}-${selectedDate}-${selectedSession}`

    const newEmployee = {
      ...employee,
      id: assignmentId,
      department: userDepartment,
      date: selectedDate,
      session: selectedSession,
    }

    setSelectedEmployees([...selectedEmployees, newEmployee])
    setSelectedEmployee("")
  }

  const handleRemoveEmployee = (id, date, session) => {
    if (!examId) return
    // Check if changes are allowed (2 hours before exam)
    if (!isEmployeeChangeAllowed(date, session)) {
      alert("Changes cannot be made within 2 hours of the examination time.")
      return
    }

    // Remove from local state
    setSelectedEmployees(
      selectedEmployees.filter((emp) => !(emp.id === id && emp.date === date && emp.session === session)),
    )

    // Also remove from the store
    const assignmentId = `${id}-${date}-${session}`
    removeAssignment(examId, userDepartment, assignmentId)
  }

  const handleSaveList = () => {
    if (!examId) {
      alert("No exam selected. Please access this page from the exam dashboard.")
      return
    }

    if (!hasChanges) {
      alert("No changes to save.")
      return
    }

    // Get current assignments to prevent duplicates
    const existingAssignments = getAssignmentsByDepartment(examId, userDepartment)
    
    // Create a map of existing assignments for quick lookup
    const existingAssignmentsMap = new Map(
      existingAssignments.map(assignment => [
        `${assignment.id}-${assignment.date}-${assignment.session}`,
        assignment
      ])
    )

    // Filter out assignments that already exist
    const newAssignments = selectedEmployees.filter(employee => {
      const key = `${employee.id}-${employee.date}-${employee.session}`
      return !existingAssignmentsMap.has(key)
    })

    // Only add new assignments
    newAssignments.forEach(employee => {
      addAssignment(examId, userDepartment, employee)
    })

    // Update original state after saving
    setOriginalEmployees(selectedEmployees)
    setHasChanges(false)

    alert("Employee list saved successfully!")
    router.push("/coordinator/dashboard")
  }

  const filteredEmployees = departmentEmployees.filter((emp) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      emp.id.toLowerCase().includes(query) ||
      emp.name.toLowerCase().includes(query) ||
      emp.designation.toLowerCase().includes(query)
    )
  })

  // Get employees for selected date and session
  const getEmployeesForDateAndSession = (date, session) => {
    return selectedEmployees.filter(
      (emp) => emp.date === date && emp.session === session
    )
  }

  if (!examId || !exam) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Invalid Examination</h2>
          <p className="text-gray-600 mb-4">The selected examination could not be found.</p>
          <button
            onClick={() => router.push("/coordinator/dashboard")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load the employee assignments.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <DashboardHeader
        title={`Available Employees - ${userDepartment}`}
        userName={user?.name}
        department={userDepartment}
      />

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
        <h2 className="text-xl font-bold mb-4">{exam.title}</h2>
        <p className="text-gray-600 mb-4">
          {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
        </p>

        {/* Date Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {examDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded ${
                selectedDate === date
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {new Date(date).toLocaleDateString()}
            </button>
          ))}
        </div>

        {/* Session Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedSession("AM")}
              className={`px-4 py-2 rounded ${
                selectedSession === "AM"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Morning Session
            </button>
            <button
              onClick={() => setSelectedSession("PM")}
              className={`px-4 py-2 rounded ${
                selectedSession === "PM"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Afternoon Session
            </button>
          </div>
        </div>

        {/* Employee Selection */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Select Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full p-3 border rounded"
            >
              <option value="">-- Select an Employee --</option>
              {filteredEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.designation}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <button
              onClick={handleAddEmployee}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
              disabled={!selectedDate || !selectedEmployee}
            >
              <UserPlus className="mr-2" size={18} />
              Add Employee for {selectedDate ? new Date(selectedDate).toLocaleDateString() : "selected date"} (
              {selectedSession})
            </button>
          </div>
        </div>

        {/* Selected Employees List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Selected Employees</h2>
            <div className="bg-gray-200 px-3 py-1 rounded">
              Current Date: {currentTime.toLocaleDateString()}
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              <strong>Note:</strong> You can only change employees up to 2 hours before the examination time.
            </p>
          </div>

          {/* Morning Session Employees */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Morning Session</h3>
            <div className="space-y-2">
              {getEmployeesForDateAndSession(selectedDate, "AM").map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div>
                    <span className="font-medium">{emp.name}</span>
                    <span className="text-gray-600 ml-2">({emp.designation})</span>
                  </div>
                  <button
                    onClick={() => handleRemoveEmployee(emp.id, emp.date, emp.session)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Afternoon Session Employees */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Afternoon Session</h3>
            <div className="space-y-2">
              {getEmployeesForDateAndSession(selectedDate, "PM").map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div>
                    <span className="font-medium">{emp.name}</span>
                    <span className="text-gray-600 ml-2">({emp.designation})</span>
                  </div>
                  <button
                    onClick={() => handleRemoveEmployee(emp.id, emp.date, emp.session)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveList}
              disabled={!hasChanges}
              className={`px-6 py-2 rounded ${
                hasChanges
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save All Employees
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get all dates between start and end date
function getExamDates(startDate, endDate) {
  const dates = []
  const currentDate = new Date(startDate)
  const lastDate = new Date(endDate)

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate).toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}
