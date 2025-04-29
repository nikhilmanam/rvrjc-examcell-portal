import Image from "next/image"
import Navbar from "./navbar"

export default function Header() {
  return (
    <header className="w-full">
      <div className="border-y-4 border-[#ff0000]">
        <div className="max-w-full mx-auto">
          <div className="flex justify-center items-center py-2 px-4">
            <Image
              src="/images/rvrjcamslogo.jpg"
              alt="RVRJCAMS Logo"
              width={1100}
              height={200}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
      <Navbar />
    </header>
  )
}
