"use client"

import { useState, useEffect } from "react"
import { Download, RefreshCw, Check, AlertCircle, Building2 } from "lucide-react"
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
  const [selectedSession, setSelectedSession] = useState("AM")

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

  const handleSessionChange = (session) => {
    setSelectedSession(session)
    setErrorMessage("")
  }

  const handleGenerateAllocations = () => {
    if (!selectedDate) {
      setErrorMessage("Please select a date first")
      return
    }

    setIsGenerating(true)
    setErrorMessage("")

    try {
      // Get all employees for the selected date and session
      const dateAssignments = getAssignmentsByDate(examId, selectedDate)
      const employees = []
      Object.values(dateAssignments).forEach((deptAssignments) => {
        deptAssignments.forEach((assignment) => {
          if (assignment.session === selectedSession) {
            employees.push(assignment)
          }
        })
      })

      // Get available rooms for the selected date and session
      const availableRooms = rooms.filter(
        (room) =>
          room.examId === examId &&
          new Date(room.date).toDateString() === selectedDate.toDateString() &&
          room.session === selectedSession
      )

      if (employees.length === 0) {
        setErrorMessage("No employees assigned for this date and session")
        return
      }

      if (availableRooms.length === 0) {
        setErrorMessage("No rooms available for allocation. Please add rooms in the Exam Section.")
        return
      }

      // Simple allocation algorithm (can be improved based on requirements)
      const newAllocations = []
      let roomIndex = 0

      employees.forEach((employee) => {
        if (roomIndex >= availableRooms.length) {
          roomIndex = 0 // Reset to first room if we run out of rooms
        }

        const room = availableRooms[roomIndex]
        newAllocations.push({
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          roomId: room.id,
          roomName: `${room.block}-${room.roomNumber}`,
          date: selectedDate.toISOString(),
          session: selectedSession,
        })

        roomIndex++
      })

      // Save allocations
      newAllocations.forEach((allocation) => {
        addDateAllocation(examId, selectedDate, allocation)
      })

      // Update local state
      setDateAllocations([...dateAllocations, ...newAllocations])
      setSubmittedDates((prev) => ({
        ...prev,
        [selectedDate.toDateString()]: true,
      }))

      alert("Room allocations generated successfully!")
    } catch (error) {
      setErrorMessage("Failed to generate allocations. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadAllocations = () => {
    // In a real app, this would generate and download a CSV file
    alert("Room allocations downloaded as CSV")
  }

  return (
    <div>
      {/* Date Selection */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {assignmentDates.map((date) => (
          <button
            key={date.toDateString()}
            onClick={() => handleDateChange(date)}
            className={`px-4 py-2 rounded ${
              selectedDate?.toDateString() === date.toDateString()
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {date.toLocaleDateString()}
          </button>
        ))}
      </div>

      {/* Session Selection */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => handleSessionChange("AM")}
            className={`px-4 py-2 rounded ${
              selectedSession === "AM"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Morning Session
          </button>
          <button
            onClick={() => handleSessionChange("PM")}
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

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="mr-2" size={18} />
          {errorMessage}
        </div>
      )}

      {selectedDate && (
        <div>
          {/* Room Allocations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Room Allocations</h3>
            <div className="space-y-4">
              {dateAllocations
                .filter((allocation) => allocation.session === selectedSession)
                .map((allocation) => (
                  <div key={allocation.employeeId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{allocation.employeeName}</span>
                        <span className="text-gray-600 ml-2">({allocation.department})</span>
                      </div>
                      <div className="flex items-center">
                        <Building2 className="mr-2 text-gray-500" size={18} />
                        <span className="font-medium">{allocation.roomName}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handleDownloadAllocations}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <Download className="mr-2" size={18} />
              Download Allocations
            </button>

            {!submittedDates[selectedDate.toDateString()] && (
              <button
                onClick={handleGenerateAllocations}
                disabled={isGenerating}
                className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                {isGenerating ? (
                  <RefreshCw className="mr-2 animate-spin" size={18} />
                ) : (
                  <Check className="mr-2" size={18} />
                )}
                Generate Allocations
              </button>
            )}
          </div>

          {submittedDates[selectedDate.toDateString()] && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
              <div className="flex items-center">
                <Check className="mr-2" size={18} />
                <span>Room allocations completed</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
