"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/data"

export default function AuthGuard({ children, allowedRole }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // If not authenticated or role doesn't match, redirect to login
    if (!isAuthenticated || (allowedRole && user?.role !== allowedRole)) {
      const loginPath = allowedRole ? `/${allowedRole}/login` : "/"
      router.push(loginPath.replace(" ", "-").toLowerCase())
    }
  }, [isAuthenticated, user, router, allowedRole])

  // If authenticated and role matches, render children
  if (isAuthenticated && (!allowedRole || user?.role === allowedRole)) {
    return <>{children}</>
  }

  // Return null while checking authentication
  return null
}
