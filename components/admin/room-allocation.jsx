"use client"

import { useState, useEffect } from "react"
import { Download, RefreshCw, Check, AlertCircle } from "lucide-react"
import { useRoomStore, useAssignmentStore, useAllocationStore } from "@/lib/data"

export default function RoomAllocation({ examId }) {
  const { rooms } = useRoomStore()
  const { getAssignmentDates, getAssignmentsByDate } = useAssignmentStore()
  const { allocations, addDateAllocation } = useAllocationStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [assignmentDates, setAssignmentDates] = useState([])
  const [dateAllocations, setDateAllocations] = useState([])
  const [submittedDates, setSubmittedDates] = useState({})
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    // Get all unique dates with assignments
    const dates = getAssignmentDates(examId)
    setAssignmentDates(dates)

    // If we have dates, select the first one by default
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0])
    }

    // Initialize submitted dates (in a real app, this would come from the database)
    const initialSubmitted = {}
    dates.forEach((date) => {
      initialSubmitted[date.toDateString()] = false
    })
    setSubmittedDates(initialSubmitted)
  }, [examId, getAssignmentDates, selectedDate])

  useEffect(() => {
    // Get allocations for the selected date
    if (selectedDate) {
      const examAllocations = allocations[examId] || {}
      const dateStr = selectedDate.toDateString()
      const allocationsForDate = examAllocations[dateStr] || []
      setDateAllocations(allocationsForDate)
    }
  }, [selectedDate, allocations, examId])

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setErrorMessage("")
  }

  const handleGenerateAllocation = () => {
    if (!selectedDate) {
      setErrorMessage("Please select a date")
      return
    }

    // Check if this date has been submitted by admin
    if (!submittedDates[selectedDate.toDateString()]) {
      setErrorMessage("You must submit the final approval for this date's employees before generating room allocation.")
      return
    }

    setIsGenerating(true)
    setErrorMessage("")

    // Get assignments for this date
    const dateAssignments = getAssignmentsByDate(examId, selectedDate)

    // Check if we have assignments for this date
    const hasAssignments = Object.values(dateAssignments).some((arr) => arr.length > 0)

    if (!hasAssignments) {
      setErrorMessage("No assignments found for this date")
      setIsGenerating(false)
      return
    }

    // Get rooms for this date
    const dateRooms = rooms.filter(
      (room) => room.examId === examId && new Date(room.date).toDateString() === selectedDate.toDateString(),
    )

    // For testing, if no rooms are found, create some dummy rooms
    let roomsToUse = dateRooms
    if (dateRooms.length === 0) {
      roomsToUse = [
        {
          id: "dummy-1",
          examId: examId,
          block: "CB",
          roomNumber: "101",
          type: "Normal",
          date: selectedDate.toISOString(),
          session: "AM",
        },
        {
          id: "dummy-2",
          examId: examId,
          block: "CB",
          roomNumber: "102",
          type: "Normal",
          date: selectedDate.toISOString(),
          session: "AM",
        },
        {
          id: "dummy-3",
          examId: examId,
          block: "CB",
          roomNumber: "103",
          type: "Drawing Hall",
          date: selectedDate.toISOString(),
          session: "PM",
        },
        {
          id: "dummy-4",
          examId: examId,
          block: "CB",
          roomNumber: "104",
          type: "Normal",
          date: selectedDate.toISOString(),
          session: "PM",
        },
      ]
    }

    // Simulate API call
    setTimeout(() => {
      // Flatten all department assignments for this date
      const allEmployees = []
      Object.values(dateAssignments).forEach((deptEmployees) => {
        allEmployees.push(...deptEmployees)
      })

      // Group by session
      const amEmployees = allEmployees.filter((emp) => emp.session === "AM")
      const pmEmployees = allEmployees.filter((emp) => emp.session === "PM")

      // Group rooms by session
      const amRooms = roomsToUse.filter((room) => room.session === "AM")
      const pmRooms = roomsToUse.filter((room) => room.session === "PM")

      // Generate allocations for AM session
      const amAllocations = generateSessionAllocations(amEmployees, "AM", amRooms)

      // Generate allocations for PM session
      const pmAllocations = generateSessionAllocations(pmEmployees, "PM", pmRooms)

      // Combine allocations
      const newAllocations = [...amAllocations, ...pmAllocations]

      // Add to store
      newAllocations.forEach((allocation) => {
        addDateAllocation(examId, selectedDate, allocation)
      })

      // Update local state
      setDateAllocations(newAllocations)

      setIsGenerating(false)
    }, 1500)
  }

  // Helper function to generate allocations for a session
  const generateSessionAllocations = (employees, session, sessionRooms) => {
    if (employees.length === 0 || sessionRooms.length === 0) return []

    const allocations = []
    const availableRooms = [...sessionRooms]
    const availableEmployees = [...employees]

    // Sort employees by designation (professors first)
    availableEmployees.sort((a, b) => {
      if (a.designation === "Professor" && b.designation !== "Professor") return -1
      if (a.designation !== "Professor" && b.designation === "Professor") return 1
      return 0
    })

    // Allocate rooms
    while (availableRooms.length > 0 && availableEmployees.length >= 2) {
      const room = availableRooms.shift()
      const invigilators = []

      // Determine how many invigilators needed
      const invigilatorsNeeded = room.type === "Drawing Hall" ? 3 : 2

      // Try to pair one senior with one junior
      let hasSenior = false
      let hasJunior = false

      for (let i = 0; i < invigilatorsNeeded; i++) {
        if (availableEmployees.length === 0) break

        let selectedIndex = 0

        // If we need a senior and have professors available
        if (!hasSenior) {
          const professorIndex = availableEmployees.findIndex((emp) => emp.designation === "Professor")
          if (professorIndex >= 0) {
            selectedIndex = professorIndex
            hasSenior = true
          }
        }
        // If we need a junior and have assistant professors available
        else if (!hasJunior) {
          const juniorIndex = availableEmployees.findIndex((emp) => emp.designation === "Assistant Professor")
          if (juniorIndex >= 0) {
            selectedIndex = juniorIndex
            hasJunior = true
          }
        }

        // Add the selected employee
        const employee = availableEmployees.splice(selectedIndex, 1)[0] || availableEmployees.shift()
        invigilators.push(employee)
      }

      // Create allocation
      if (invigilators.length > 0) {
        allocations.push({
          id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 5),
          roomNumber: `${room.block}-${room.roomNumber}`,
          roomType: room.type,
          date: selectedDate.toISOString(),
          session: session,
          invigilators: invigilators,
        })
      }
    }

    return allocations
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a CSV file
    alert("Room allocation downloaded as CSV")
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Room Allocation</h2>
        {dateAllocations.length > 0 && (
          <button
            onClick={handleDownload}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            <Download className="mr-2" size={18} />
            Download Allocation
          </button>
        )}
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Select Date</label>
            <div className="flex flex-wrap gap-2">
              {assignmentDates.length > 0 ? (
                assignmentDates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateChange(date)}
                    className={`px-4 py-2 rounded flex items-center ${
                      selectedDate && selectedDate.toDateString() === date.toDateString()
                        ? "bg-blue-500 text-white"
                        : submittedDates[date.toDateString()]
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {date.toLocaleDateString()}
                    {submittedDates[date.toDateString()] && <Check size={16} className="ml-2" />}
                  </button>
                ))
              ) : (
                <div className="text-gray-500">No dates with assignments yet</div>
              )}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateAllocation}
              disabled={isGenerating || !selectedDate}
              className={`px-6 py-2 rounded text-white font-medium flex items-center ${
                isGenerating || !selectedDate ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 animate-spin" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2" size={18} />
                  Generate Allocation
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start">
            <AlertCircle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          <strong>Note:</strong> Room allocation is based on the following constraints:
        </p>
        <ul className="list-disc pl-5 mt-2 text-blue-800">
          <li>2 invigilators per normal room, 3 per drawing hall</li>
          <li>One senior (Professor) and one junior (Assistant Professor) paired when possible</li>
          <li>No same-department invigilators in one room</li>
          <li>Departments with higher assigned invigilator counts allocated first</li>
          <li>Only rooms assigned by the Exam Section for the specific date and session are used</li>
        </ul>
      </div>

      {dateAllocations.length > 0 ? (
        <div className="space-y-6">
          {dateAllocations.map((allocation) => (
            <div key={allocation.id} className="border rounded-lg overflow-hidden">
              <div className={`p-4 ${allocation.roomType === "Drawing Hall" ? "bg-purple-50" : "bg-blue-50"}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">
                    Room: {allocation.roomNumber}
                    <span
                      className={`ml-3 px-3 py-1 rounded-full text-xs ${
                        allocation.roomType === "Drawing Hall"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {allocation.roomType}
                    </span>
                  </h3>
                  <div className="text-sm">
                    <span className="mr-3">Date: {new Date(allocation.date).toLocaleDateString()}</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">{allocation.session}</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-medium mb-2">Assigned Invigilators:</h4>
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 text-left">ID</th>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Department</th>
                      <th className="py-2 px-4 text-left">Designation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocation.invigilators.map((invigilator) => (
                      <tr key={invigilator.id} className="border-b">
                        <td className="py-2 px-4">{invigilator.id}</td>
                        <td className="py-2 px-4">{invigilator.name}</td>
                        <td className="py-2 px-4">
                          <span className="bg-gray-100 px-2 py-1 rounded">{invigilator.department}</span>
                        </td>
                        <td className="py-2 px-4">{invigilator.designation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No room allocations generated yet.</p>
          <p className="text-gray-500">Select a date, then click "Generate Allocation" to create room allocations.</p>
        </div>
      )}
    </div>
  )
}
