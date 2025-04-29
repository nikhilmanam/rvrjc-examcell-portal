import LoginForm from "@/components/auth/login-form"

export default function EmployeeLogin() {
  return (
    <div className="container mx-auto">
      <LoginForm userType="Employee" />
    </div>
  )
}
