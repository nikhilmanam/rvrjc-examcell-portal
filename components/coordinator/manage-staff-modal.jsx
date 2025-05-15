"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { isEmployeeChangeAllowed, useAssignmentStore } from "@/lib/data"
import { useDepartmentEmployees } from "@/lib/hooks"

export default function ManageStaffModal({ onClose, department, examId }) {
  const { addAssignment } = useAssignmentStore()
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSession, setSelectedSession] = useState("AM")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Map department name to departmentId (adjust as needed)
  const departmentMap = {
    CSE: 1, CSBS: 2, "CSE(DS)": 3, "CSE(AILML)": 4, "CSE(IOT)": 5, IT: 6, ECE: 7, EEE: 8, CHE: 9, CIVIL: 10, MECH: 11, MCA: 12, MBA: 13
  }
  const departmentId = departmentMap[department] || 1
  const departmentEmployees = useDepartmentEmployees(departmentId)

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const canChangeEmployee = (date, session) => {
    // Use the isEmployeeChangeAllowed function from data.js
    return isEmployeeChangeAllowed(date, session)
  }

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

    const newEmployee = {
      ...employee,
      department: department,
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

    setSelectedEmployees(
      selectedEmployees.filter((emp) => !(emp.id === id && emp.date === date && emp.session === session)),
    )
  }

  const handleSaveList = () => {
    // Save each employee assignment to the assignment store
    selectedEmployees.forEach((employee) => {
      // Create a unique ID for this assignment
      const assignmentId = `${employee.id}-${employee.date}-${employee.session}`

      // Add to the assignment store
      addAssignment(
        examId, // Pass the exam ID
        employee.department,
        {
          ...employee,
          id: assignmentId,
        },
      )
    })

    alert("Employee list saved successfully!")
    onClose()
  }

  const handleAddNewEmployee = async (newEmp) => {
    // newEmp: { name, qualification, designation }
    // You need to map department name to department_id and set a default role_id (e.g., 1 for 'employee')
    const departmentMap = {
      CSE: 1, CSBS: 2, "CSE(DS)": 3, "CSE(AILML)": 4, "CSE(IOT)": 5, IT: 6, ECE: 7, EEE: 8, CHE: 9, CIVIL: 10, MECH: 11, MCA: 12, MBA: 13
    }
    const department_id = departmentMap[department] || 1
    const role_id = 1 // Assuming 1 is the default role for 'employee'
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newEmp.name,
        qualification: newEmp.qualification,
        designation: newEmp.designation,
        department_id,
        role_id
      })
    })
    if (res.ok) {
      alert('Employee added!')
      // Optionally, refresh the employee list
      // You can call setDepartmentEmployees or trigger a re-fetch
    } else {
      alert('Failed to add employee')
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Available Employees - {department}</h2>
          <button
            onClick={onClose}
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded flex items-center"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Dashboard
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="flex items-center mb-2">
                <Calendar className="mr-2" size={18} />
                Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center mb-2">
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
              Add Employee for {selectedDate ? new Date(selectedDate).toLocaleDateString() : "selected date"} (
              {selectedSession})
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Selected Employees (Today & Future Dates Only)</h3>
            <div className="bg-gray-50 p-2 rounded text-right mb-2">
              <span className="text-sm">Current Date: {currentTime.toLocaleDateString()}</span>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>Note:</strong> You can only change employees up to 2 hours before the examination time.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border text-left">ID</th>
                    <th className="py-2 px-4 border text-left">Name</th>
                    <th className="py-2 px-4 border text-left">Department</th>
                    <th className="py-2 px-4 border text-left">Designation</th>
                    <th className="py-2 px-4 border text-left">Date</th>
                    <th className="py-2 px-4 border text-left">Session</th>
                    <th className="py-2 px-4 border text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEmployees.length > 0 ? (
                    selectedEmployees.map((emp) => {
                      const canChange = canChangeEmployee(emp.date, emp.session)
                      return (
                        <tr key={`${emp.id}-${emp.date}-${emp.session}`} className="border-b">
                          <td className="py-2 px-4 border">{emp.id}</td>
                          <td className="py-2 px-4 border">{emp.name}</td>
                          <td className="py-2 px-4 border">{emp.department}</td>
                          <td className="py-2 px-4 border">{emp.designation}</td>
                          <td className="py-2 px-4 border">
                            {new Date(emp.date).toLocaleDateString()}
                            {new Date(emp.date).toDateString() === new Date().toDateString() && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Today</span>
                            )}
                          </td>
                          <td className="py-2 px-4 border">
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">{emp.session}</span>
                          </td>
                          <td className="py-2 px-4 border">
                            {canChange ? (
                              <button
                                onClick={() => handleRemoveEmployee(emp.id, emp.date, emp.session)}
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

            <div className="mt-4 flex items-center text-gray-600">
              <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                <span className="text-sm">{selectedEmployees.length}</span>
              </div>
              <span>of {selectedEmployees.length} employees shown (past dates hidden)</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveList} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
              Save Employee List
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
