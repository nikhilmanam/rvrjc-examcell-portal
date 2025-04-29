import LoginForm from "@/components/auth/login-form"

export default function CoordinatorLogin() {
  return (
    <div className="container mx-auto">
      <LoginForm userType="Coordinator" />
    </div>
  )
}
