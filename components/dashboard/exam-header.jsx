export default function ExamHeader({ examTitle, subtitle }) {
  return (
    <div className="bg-blue-600 text-white rounded-lg p-6 mb-6 text-center">
      <h2 className="text-2xl font-bold">{examTitle}</h2>
      {subtitle && <p className="mt-2 text-lg">{subtitle}</p>}
    </div>
  )
}
