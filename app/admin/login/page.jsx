import LoginForm from "@/components/auth/login-form"

export default function AdminLogin() {
  return (
    <div className="container mx-auto">
      <LoginForm userType="Admin" />
    </div>
  )
}
