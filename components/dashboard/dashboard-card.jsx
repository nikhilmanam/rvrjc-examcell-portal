"use client"

import Link from "next/link"

export default function DashboardCard({ title, description, icon, buttonText, buttonLink, onClick }) {
  const CardIcon = icon

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          {CardIcon && <CardIcon className="w-8 h-8 text-blue-600" />}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
        {buttonText && buttonLink && (
          <Link
            href={buttonLink}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              buttonText.toLowerCase().includes("manage")
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {buttonText}
          </Link>
        )}
        {buttonText && onClick && (
          <button
            onClick={onClick}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              buttonText.toLowerCase().includes("manage")
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}
