import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthService } from '../services/authService'

export default function ProtectedRoute({ children }) {
    const user = AuthService.getSession()
    const token = AuthService.getToken()
    const location = useLocation()

    if (!user || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}
