export default function ExamHeader({ examTitle, subtitle }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8 mb-8 shadow-lg">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-3">{examTitle}</h2>
        {subtitle && (
          <p className="text-lg text-blue-100 opacity-90">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
