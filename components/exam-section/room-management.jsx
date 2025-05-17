"use client"

import { useState, useEffect } from "react"
import { Download, Plus, Save, ArrowLeft, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RoomManagement({ examId }) {
  const router = useRouter()
  const blocks = ["CB", "DG", "MN", "HT", "SJB"]

  const [rooms, setRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dateRange, setDateRange] = useState([])
  const [selectedSession, setSelectedSession] = useState("AM")

  const [newRoom, setNewRoom] = useState({
    block: "CB",
    roomNumber: "",
    type: "Normal",
    date: null,
    session: "AM",
  })

  // Fetch rooms from backend
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true)
      const res = await fetch(`/api/rooms?exam_id=${examId}`)
      if (!res.ok) throw new Error('Failed to fetch rooms')
      const data = await res.json()
      setRooms(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setRooms([])
    } finally {
      setLoadingRooms(false)
    }
  }

  useEffect(() => {
    if (examId) fetchRooms()
  }, [examId])

  // Fetch date range from exam (fetch exam details here)
  useEffect(() => {
    async function fetchExamDetails() {
      if (!examId) return;
      const res = await fetch(`/api/examinations/${examId}`);
      if (!res.ok) return;
      const exam = await res.json();
      if (exam.start_date && exam.end_date) {
        const start = new Date(exam.start_date);
        const end = new Date(exam.end_date);
        const range = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          range.push(new Date(d));
        }
        setDateRange(range.map(d => new Date(d)));
      }
    }
    fetchExamDetails();
  }, [examId]);

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

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber || !selectedDate) return
    const payload = {
      exam_id: Number(examId),
      block: newRoom.block,
      room_number: newRoom.roomNumber,
      type: newRoom.type,
      date: selectedDate.toISOString().split("T")[0],
      session: selectedSession,
    }
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      await fetchRooms()
      setNewRoom({
        block: "CB",
        roomNumber: "",
        type: "Normal",
        date: selectedDate.toISOString(),
        session: selectedSession,
      })
    } else {
      const error = await res.json()
      alert("Failed to add room: " + (error.error || "Unknown error"))
      await fetchRooms()
    }
  }

  const handleDeleteRoom = async (id) => {
    const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" })
    if (res.ok) {
      await fetchRooms()
    } else {
      alert("Failed to delete room.")
    }
  }

  const handleSave = () => {
    // All changes are already saved to backend
    alert("Rooms saved successfully!")
  }

  const handleDownload = () => {
    // Generate CSV content
    const headers = ["Block", "Room Number", "Type", "Date", "Session"]
    const rows = rooms.map(room => [room.block, room.room_number, room.type, room.date, room.session])
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `rooms_${examId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Debug logging
  console.log("All rooms:", rooms)
  console.log("Selected date:", selectedDate, "Session:", selectedSession, "ExamId:", examId)

  // Filter rooms for this exam, date and session
  const filteredRooms = rooms.filter(
    (room) =>
      String(room.exam_id) === String(examId) &&
      selectedDate &&
      new Date(room.date).toDateString() === selectedDate.toDateString() &&
      room.session === selectedSession,
  )

  // For debugging: if filteredRooms is empty, show all rooms
  const showAllRooms = filteredRooms.length === 0

  if (loadingRooms) {
    return <div className="text-center py-8">Loading rooms...</div>
  }

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
              <th className="py-3 px-4 border text-left">Date</th>
              <th className="py-3 px-4 border text-left">Session</th>
              <th className="py-3 px-4 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {showAllRooms
              ? rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="py-2 px-4 border">{room.block}</td>
                    <td className="py-2 px-4 border">{room.room_number}</td>
                    <td className="py-2 px-4 border">{room.type}</td>
                    <td className="py-2 px-4 border">{room.date}</td>
                    <td className="py-2 px-4 border">{room.session}</td>
                    <td className="py-2 px-4 border">
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              : filteredRooms.map((room) => (
                  <tr key={room.id}>
                    <td className="py-2 px-4 border">{room.block}</td>
                    <td className="py-2 px-4 border">{room.room_number}</td>
                    <td className="py-2 px-4 border">{room.type}</td>
                    <td className="py-2 px-4 border">{room.date}</td>
                    <td className="py-2 px-4 border">{room.session}</td>
                    <td className="py-2 px-4 border">
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
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
