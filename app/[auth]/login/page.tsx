'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'


export default function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: '',
        rememberMe: false
    })
    const [errors, setErrors] = useState<{[key: string]: string}>({})

    const { theme } = useTheme()
    const router = useRouter()

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {}
        
        if (!formData.emailOrUsername) {
            newErrors.emailOrUsername = 'Email or username is required'
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) return
        
        setIsLoading(true)
        
        try {
            // Determine if input is email or username
            const isEmail = /\S+@\S+\.\S+/.test(formData.emailOrUsername)
            const loginData = isEmail 
                ? { email: formData.emailOrUsername, password: formData.password }
                : { username: formData.emailOrUsername, password: formData.password }

            const response = await fetch('http://192.168.10.85:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Login failed')
            }

            const data = await response.json()
            console.log('Login successful:', data)
            
            // Store token using the correct keys that match the main auth system
            if (data.token) {
                if (formData.rememberMe) {
                    localStorage.setItem('auth_token', data.token)
                } else {
                    sessionStorage.setItem('auth_token', data.token)
                }
            }

            // Store user data using the correct key
            if (data.user) {
                const user = {
                    id: data.user.id || data.user._id,
                    email: data.user.email,
                    name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.username,
                    avatar: data.user.profilePicture || data.user.avatar,
                    role: data.user.role || 'user',
                    subscription: {
                        type: data.user.membership || data.user.subscription?.type || 'free',
                        isActive: data.user.subscription?.isActive || false
                    }
                }
                localStorage.setItem('user_data', JSON.stringify(user))
                
                // Import and dispatch the auth action to update Redux state
                if (typeof window !== 'undefined') {
                    import('@/lib/store').then(({ store }) => {
                        import('@/lib/features/authSlice').then(({ loginSuccess }) => {
                            store.dispatch(loginSuccess({
                                user,
                                token: data.token,
                                refreshToken: data.refreshToken
                            }))
                        })
                    })
                }
            }

            // Small delay to allow state to update, then redirect
            setTimeout(() => {
                router.push('/')
            }, 100)
            
        } catch (error: any) {
            console.error('Login error:', error)
            setErrors({ 
                general: error.message || 'Login failed. Please check your credentials and try again.' 
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-accent/20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-sm w-full space-y-12">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center">
                        {mounted ? (
                            <Image src={theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} alt="logo" width={100} height={100} />
                        ) : (
                            <Image src="/logo-small.webp" alt="logo" width={100} height={100} />
                        )}
                    </div>
                   
                    <p className="mt-6">
                        Log in to continue with premium access
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-card rounded-lg shadow-lg border border-border p-8 pt-12 pb-12">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* General Error Message */}
                        {errors.general && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <p className="text-sm text-destructive">{errors.general}</p>
                            </div>
                        )}
                        
                        {/* Email/Username Field */}
                        <div>
                            <label htmlFor="emailOrUsername" className="block text-sm font-medium text-card-foreground mb-2">
                                Email / Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    id="emailOrUsername"
                                    name="emailOrUsername"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={formData.emailOrUsername}
                                    onChange={handleInputChange}
                                    className={`appearance-none relative block w-full pl-4 pr-3 py-3 border ${
                                        errors.emailOrUsername ? 'border-destructive' : 'border-input'
                                    } placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background transition-colors`}
                                    placeholder="Enter your email or username"
                                />
                            </div>
                            {errors.emailOrUsername && (
                                <p className="mt-1 text-sm text-destructive">{errors.emailOrUsername}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`appearance-none relative block w-full pl-4 pr-10 py-3 border ${
                                        errors.password ? 'border-destructive' : 'border-input'
                                    } placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background transition-colors`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-muted-foreground hover:text-red-800 hover:cursor-pointer transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-muted-foreground hover:text-red-800 hover:cursor-pointer transition-colors" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between ">
                            <div className="flex items-center hover:cursor-pointer">
                                <input
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    className="h-3 w-3 text-primary focus:ring-ring border-input rounded "
                                />
                                <label htmlFor="rememberMe" className="ml-1 block text-sm text-muted-foreground hover:cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link
                                    href="/forgot-password"
                                    className="font-medium text-primary hover:text-red-800 transition-colors"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className='pt-4'>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 text-white border border-transparent font-medium rounded-lg bg-red-800 hover:scale-101 hover:cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    {/* <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                            </div>
                        </div>
                    </div> */}

                    {/* Social Login Buttons */}
                    {/* <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="ml-2">Google</span>
                        </button>

                        <button
                            type="button"
                            className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span className="ml-2">Facebook</span>
                        </button>
                    </div> */}
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Not a member?{' '}
                            <Link href="/auth/premium" className="font-medium text-primary hover:text-red-800 transition-colors">
                                Get premium access now
                            </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

