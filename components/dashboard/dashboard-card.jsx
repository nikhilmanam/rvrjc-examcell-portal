"use client"

import Link from "next/link"

export default function DashboardCard({ title, description, icon, buttonText, buttonLink, onClick }) {
  const CardIcon = icon

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col items-center text-center">
        <div className="text-blue-600 mb-4">{CardIcon && <CardIcon className="w-12 h-12" />}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        {buttonText && buttonLink && (
          <Link
            href={buttonLink}
            className={`px-4 py-2 rounded ${
              buttonText.toLowerCase().includes("manage")
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {buttonText}
          </Link>
        )}
        {buttonText && onClick && (
          <button
            onClick={onClick}
            className={`px-4 py-2 rounded ${
              buttonText.toLowerCase().includes("manage")
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}
