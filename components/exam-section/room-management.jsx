"use client"

import { useState, useEffect } from "react"
import { Download, Plus, Save, ArrowLeft, Calendar } from "lucide-react"
import { useRoomStore, useExamStore } from "@/lib/data"
import { useRouter } from "next/navigation"

export default function RoomManagement({ examId }) {
  const router = useRouter()
  const blocks = ["CB", "DG", "MN", "HT", "SJB"]
  const { rooms, addRoom, deleteRoom } = useRoomStore()
  const { examinations } = useExamStore()

  const [selectedDate, setSelectedDate] = useState(null)
  const [dateRange, setDateRange] = useState([])
  const [selectedSession, setSelectedSession] = useState("AM")

  const [newRoom, setNewRoom] = useState({
    examId: examId,
    block: "CB",
    roomNumber: "",
    type: "Normal",
    date: null,
    session: "AM",
  })

  useEffect(() => {
    // Find the examination by ID
    const foundExam = examinations.find((e) => e.id === examId)

    if (foundExam && foundExam.startDate && foundExam.endDate) {
      // Generate date range between start and end dates
      const start = new Date(foundExam.startDate)
      const end = new Date(foundExam.endDate)
      const dates = []

      const currentDate = new Date(start)
      while (currentDate <= end) {
        dates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }

      setDateRange(dates)

      // Set default selected date to the first date
      if (dates.length > 0 && !selectedDate) {
        setSelectedDate(dates[0])
        setNewRoom((prev) => ({
          ...prev,
          date: dates[0].toISOString(),
        }))
      }
    }
  }, [examId, examinations, selectedDate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewRoom((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setNewRoom((prev) => ({
      ...prev,
      date: date.toISOString(),
    }))
  }

  const handleSessionChange = (session) => {
    setSelectedSession(session)
    setNewRoom((prev) => ({
      ...prev,
      session: session,
    }))
  }

  const handleAddRoom = () => {
    if (!newRoom.roomNumber || !selectedDate) return

    addRoom({
      ...newRoom,
      date: selectedDate.toISOString(),
      session: selectedSession,
    })

    // Reset form (but keep date and session)
    setNewRoom({
      examId: examId,
      block: "CB",
      roomNumber: "",
      type: "Normal",
      date: selectedDate.toISOString(),
      session: selectedSession,
    })
  }

  const handleDeleteRoom = (id) => {
    deleteRoom(id)
  }

  const handleSave = () => {
    // In a real app, this would save to a database
    alert("Rooms saved successfully!")
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a CSV file
    alert("Room list downloaded as CSV")
  }

  // Filter rooms for this exam, date and session
  const filteredRooms = rooms.filter(
    (room) =>
      room.examId === examId &&
      selectedDate &&
      new Date(room.date).toDateString() === selectedDate.toDateString() &&
      room.session === selectedSession,
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/exam-section/dashboard")}
            className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back
          </button>
          <h2 className="text-xl font-bold">Room Management</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
          >
            <Save className="mr-2" size={18} />
            Save Rooms
          </button>

          <button
            onClick={handleDownload}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            <Download className="mr-2" size={18} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Select Date</label>
          <div className="flex flex-wrap gap-2">
            {dateRange.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateChange(date)}
                className={`px-4 py-2 rounded flex items-center ${
                  selectedDate && selectedDate.toDateString() === date.toDateString()
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                <Calendar className="mr-2" size={16} />
                {date.toLocaleDateString()}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Select Session</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleSessionChange("AM")}
              className={`px-4 py-2 rounded ${
                selectedSession === "AM" ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Morning (AM)
            </button>
            <button
              onClick={() => handleSessionChange("PM")}
              className={`px-4 py-2 rounded ${
                selectedSession === "PM" ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Afternoon (PM)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Block</label>
          <select name="block" value={newRoom.block} onChange={handleInputChange} className="w-full p-2 border rounded">
            {blocks.map((block) => (
              <option key={block} value={block}>
                {block}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Room Number</label>
          <input
            type="text"
            name="roomNumber"
            value={newRoom.roomNumber}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., 101"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Room Type</label>
          <select name="type" value={newRoom.type} onChange={handleInputChange} className="w-full p-2 border rounded">
            <option value="Normal">Normal</option>
            <option value="Drawing Hall">Drawing Hall</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleAddRoom}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded flex items-center"
          disabled={!newRoom.roomNumber || !selectedDate}
        >
          <Plus className="mr-2" size={18} />
          Add Room
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">
          Rooms for {selectedDate ? selectedDate.toLocaleDateString() : "Selected Date"} -{" "}
          {selectedSession === "AM" ? "Morning" : "Afternoon"} Session
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border text-left">Block</th>
              <th className="py-3 px-4 border text-left">Room Number</th>
              <th className="py-3 px-4 border text-left">Type</th>
              <th className="py-3 px-4 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td className="py-2 px-4 border">{room.block}</td>
                  <td className="py-2 px-4 border">{room.roomNumber}</td>
                  <td className="py-2 px-4 border">{room.type}</td>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  No rooms added for this date and session yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
