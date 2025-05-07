import Navbar from "./navbar"

export default function Header() {
  return (
    <header className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center py-4">
          <h1 className="text-3xl font-bold text-[#1a237e] mb-2">R.V.R & J.C College of Engineering</h1>
          <h2 className="text-xl text-gray-600">Examination Invigilation Management System</h2>
        </div>
      </div>
      <Navbar />
    </header>
  )
}
