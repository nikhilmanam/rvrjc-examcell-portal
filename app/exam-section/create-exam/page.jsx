"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { ArrowLeft } from "lucide-react"

export default function CreateExam() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    morningStartTime: "09:00",
    morningEndTime: "12:00",
    afternoonStartTime: "14:00",
    afternoonEndTime: "17:00",
    morningSession: true,
    afternoonSession: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Prepare data for backend
    const payload = {
      title: formData.title,
      start_date: formData.startDate,
      end_date: formData.endDate,
      morning_start_time: formData.morningSession ? formData.morningStartTime : null,
      morning_end_time: formData.morningSession ? formData.morningEndTime : null,
      afternoon_start_time: formData.afternoonSession ? formData.afternoonStartTime : null,
      afternoon_end_time: formData.afternoonSession ? formData.afternoonEndTime : null,
    }
    const res = await fetch("/api/examinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
    router.push("/exam-section/dashboard")
    } else {
      alert("Failed to create examination series.")
    }
  }

  return (
    <div className="container mx-auto">
      <DashboardHeader title="Create New Examination Series" />

      <div className="mb-6 flex">
        <button
          onClick={() => router.push("/exam-section/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Examination Series Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3rd year regular and supply examination 24-25"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Session Timings</h3>

            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="morningSession"
                  checked={formData.morningSession}
                  onChange={handleChange}
                  className="mr-2"
                  id="morningSession"
                />
                <label htmlFor="morningSession" className="font-medium">
                  Morning Session (AM)
                </label>
              </div>

              {formData.morningSession && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Start Time</label>
                    <input
                      type="time"
                      name="morningStartTime"
                      value={formData.morningStartTime}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-1">End Time</label>
                    <input
                      type="time"
                      name="morningEndTime"
                      value={formData.morningEndTime}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="afternoonSession"
                  checked={formData.afternoonSession}
                  onChange={handleChange}
                  className="mr-2"
                  id="afternoonSession"
                />
                <label htmlFor="afternoonSession" className="font-medium">
                  Afternoon Session (PM)
                </label>
              </div>

              {formData.afternoonSession && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Start Time</label>
                    <input
                      type="time"
                      name="afternoonStartTime"
                      value={formData.afternoonStartTime}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-1">End Time</label>
                    <input
                      type="time"
                      name="afternoonEndTime"
                      value={formData.afternoonEndTime}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/exam-section/dashboard")}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Create Examination
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
