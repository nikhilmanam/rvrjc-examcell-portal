import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to employee login as per requirement
  redirect("/employee/login")
}
