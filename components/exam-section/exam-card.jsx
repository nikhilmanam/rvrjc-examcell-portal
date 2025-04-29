import Link from "next/link"
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react"

export default function ExamCard({ exam }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`p-4 ${exam.status === "complete" ? "bg-green-500" : "bg-blue-500"} text-white`}>
        <h3 className="font-bold text-lg truncate">{exam.title}</h3>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Calendar className="mr-2 text-gray-500" size={18} />
            <span className="text-gray-700">
              {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
            </span>
          </div>

          <div className="flex items-center">
            <Clock className="mr-2 text-gray-500" size={18} />
            <span className="text-gray-700">Sessions: Morning & Afternoon</span>
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <div className={`flex items-center ${exam.status === "complete" ? "text-green-500" : "text-amber-500"}`}>
            {exam.status === "complete" ? (
              <>
                <CheckCircle className="mr-1" size={18} />
                <span className="font-medium">Completed</span>
              </>
            ) : (
              <>
                <XCircle className="mr-1" size={18} />
                <span className="font-medium">Not Completed</span>
              </>
            )}
          </div>
        </div>

        <Link
          href={`/exam-section/manage/${exam.id}`}
          className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          {exam.status === "complete" ? "View Details" : "Manage Requirements"}
        </Link>
      </div>
    </div>
  )
}
