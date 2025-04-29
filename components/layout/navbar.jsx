import Link from "next/link"

export default function Navbar() {
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Admin", path: "/admin/login" },
    { name: "Employee", path: "/employee/login" },
    { name: "Coordinator", path: "/coordinator/login" },
    { name: "Exam Section", path: "/exam-section/login" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <nav className="bg-[#0000ff] py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="bg-[#ffa500] rounded-lg w-full">
            <div className="flex justify-center items-center">
              {navItems.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <Link href={item.path} className="text-black font-bold text-xl px-6 py-2 hover:underline">
                    {item.name}
                  </Link>
                  {index < navItems.length - 1 && <span className="text-black font-bold">|</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
