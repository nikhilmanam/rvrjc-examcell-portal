"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Calendar, Clock, UserPlus } from "lucide-react"
import { employees, useAuthStore, useAssignmentStore } from "@/lib/data"
import { isEmployeeChangeAllowed } from "@/lib/utils"

export default function ManageStaff() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { addAssignment, getAssignmentsByDepartment, removeAssignment } = useAssignmentStore()
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSession, setSelectedSession] = useState("AM")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Get department from user
  const userDepartment = user?.department || "CSE"
  const departmentEmployees = employees[userDepartment] || []

  // Load previously saved employees when component mounts
  useEffect(() => {
    // Get all assignments for this department
    const savedAssignments = getAssignmentsByDepartment(userDepartment)

    if (savedAssignments && savedAssignments.length > 0) {
      setSelectedEmployees(savedAssignments)
    }
  }, [userDepartment, getAssignmentsByDepartment])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const handleAddEmployee = () => {
    if (!selectedEmployee || !selectedDate) return

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
    removeAssignment(null, userDepartment, assignmentId)
  }

  const handleSaveList = () => {
    // Save each employee assignment to the assignment store
    selectedEmployees.forEach((employee) => {
      // Add to the assignment store - using null for examId since we're organizing by department
      addAssignment(
        null, // We're not using exam ID for this view
        userDepartment,
        employee,
      )
    })

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

  // Check if employee can be changed (within 2 hours of exam time)
  const canChangeEmployee = (date, session) => {
    return isEmployeeChangeAllowed(date, session)
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="flex items-center mb-2 font-medium">
              <Calendar className="mr-2" size={18} />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="flex items-center mb-2 font-medium">
              <Clock className="mr-2" size={18} />
              Select Session
            </label>
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded ${
                  selectedSession === "AM" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedSession("AM")}
              >
                AM
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  selectedSession === "PM" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedSession("PM")}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, ID or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border rounded"
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Selected Employees (Today & Future Dates Only)</h2>
          <div className="bg-gray-200 px-3 py-1 rounded">Current Date: {currentTime.toLocaleDateString()}</div>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            <strong>Note:</strong> You can only change employees up to 2 hours before the examination time.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Department</th>
                <th className="py-2 px-4 border-b text-left">Designation</th>
                <th className="py-2 px-4 border-b text-left">Date</th>
                <th className="py-2 px-4 border-b text-left">Session</th>
                <th className="py-2 px-4 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedEmployees.length > 0 ? (
                selectedEmployees.map((employee) => {
                  const canChange = canChangeEmployee(employee.date, employee.session)
                  return (
                    <tr key={`${employee.id}-${employee.date}-${employee.session}`}>
                      <td className="py-2 px-4 border-b">{employee.id}</td>
                      <td className="py-2 px-4 border-b">{employee.name}</td>
                      <td className="py-2 px-4 border-b">{employee.department}</td>
                      <td className="py-2 px-4 border-b">{employee.designation}</td>
                      <td className="py-2 px-4 border-b">
                        {new Date(employee.date).toLocaleDateString()}
                        {new Date(employee.date).toDateString() === new Date().toDateString() && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Today</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <span className="bg-amber-400 px-2 py-1 rounded text-black">{employee.session}</span>
                      </td>
                      <td className="py-2 px-4 border-b">
                        {canChange ? (
                          <button
                            onClick={() => handleRemoveEmployee(employee.id, employee.date, employee.session)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">Locked</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-gray-500">
                    No employees selected yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-gray-600">
            <span className="bg-gray-200 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
              {selectedEmployees.length}
            </span>
            of {selectedEmployees.length} employees shown (past dates hidden)
          </div>

          <button onClick={handleSaveList} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Save Employee List
          </button>
        </div>
      </div>
    </div>
  )
}
