'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGoogleLoginMutation } from '@/lib/services/authApi'
import { getGoogleAuthUrl, GoogleUser } from '@/lib/services/googleOAuth'
import { useAppDispatch } from '@/lib/hooks'
import { loginSuccess } from '@/lib/features/authSlice'
import { setAuthTokens, setUserData } from '@/lib/utils/auth'

export default function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: '',
    })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [isGoogleAuthInProgress, setIsGoogleAuthInProgress] = useState(false)

    const { theme } = useTheme()
    const router = useRouter()
    const { login, isLoading, isAuthenticated } = useAuth()
    const { trackUserLogin } = useAnalytics()
    const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation()
    const dispatch = useAppDispatch()


    useEffect(() => {
        const savedEmail = localStorage.getItem('emailOrUsername');
        const savedPassword = localStorage.getItem('password');
        if (savedEmail && savedPassword) {
            setFormData({
                emailOrUsername: savedEmail || '',
                password: savedPassword || '',
            })
            setRememberMe(true);
        }
    }, [])

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/')
        }
    }, [isAuthenticated, router])

    // Handle Google OAuth callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const googleAuth = urlParams.get('google_auth')
        const googleUserParam = urlParams.get('google_user')
        const error = urlParams.get('error')
        const message = urlParams.get('message')

        console.log('Google OAuth callback params:', { googleAuth, googleUserParam, error, message })

        if (error) {
            console.error('Google OAuth error:', error, message)
            setErrors({
                general: message ? decodeURIComponent(message) : 'Google authentication failed'
            })
            return
        }

        if (googleAuth === 'true' && googleUserParam) {
            try {
                const googleUser: GoogleUser = JSON.parse(decodeURIComponent(googleUserParam))
                console.log('Parsed Google user:', googleUser)
                setIsGoogleAuthInProgress(true)
                handleGoogleLogin(googleUser)
            } catch (error) {
                console.error('Error parsing Google user data:', error)
                setErrors({
                    general: 'Failed to process Google authentication data'
                })
                setIsGoogleAuthInProgress(false)
            }
        }
    }, [])

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

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

        try {
            // Use the auth system with email or username - let the backend handle both
            const result = await login(formData.emailOrUsername, formData.password)

            if (result.success) {
                // Track successful login
                trackUserLogin('email')

                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || '/';
                console.log(redirect)
                if (rememberMe) {
                    localStorage.setItem('emailOrUsername', formData.emailOrUsername);
                    localStorage.setItem('password', formData.password);
                } else {
                    localStorage.removeItem('emailOrUsername');
                    localStorage.removeItem('password');
                }

                // The auth system already handles localStorage, but we ensure it's persistent
                const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
                if (token) {
                    localStorage.setItem('auth_token', token)
                    sessionStorage.removeItem('auth_token')
                }

                // After successful login, if user came from FastDraft and doesn't
                // have Stripe customer/subscription, force onboarding page
                const user = result.user as any
                const isFastDraftContext = (user?.context || '').toLowerCase() === 'fastdraft'
                const hasStripeCustomer = typeof user?.stripeCustomerId === 'string' && user.stripeCustomerId.trim().length > 0
                const hasStripeSubscription = typeof user?.stripeSubscriptionId === 'string' && user.stripeSubscriptionId.trim().length > 0
                const hasPaidMembership = user?.membership === 'premium' || user?.membership === 'pro' || (user?.memberships?.type === 'pro')
                const hasStripe = hasStripeCustomer || hasStripeSubscription || hasPaidMembership
                if (isFastDraftContext && !hasStripe) {
                    router.push('/fastdraft/complete-registration')
                } else {
                    router.push('/feeds/nuggets')
                }
            } else {
                setErrors({
                    general: result.error || 'Login failed. Please check your credentials and try again.'
                })
            }

        } catch (error: any) {
            console.error('Login error:', error)
            setErrors({
                general: error.message || 'Login failed. Please check your credentials and try again.'
            })
        }
    }

    const handleGoogleLogin = async (googleUser: GoogleUser) => {
        try {
            console.log('Starting Google login with user:', googleUser)

            const result = await googleLogin({
                email: googleUser.email,
                googleId: googleUser.id,
                firstName: googleUser.given_name,
                lastName: googleUser.family_name,
                profilePicture: googleUser.picture
            }).unwrap()

            console.log('Google login result:', result)

            // Update Redux state (same as regular login)
            dispatch(loginSuccess({
                user: result.user,
                token: result.token,
                refreshToken: result.refreshToken
            }))

            // Store tokens and user data (same as regular login)
            setAuthTokens(result.token, result.refreshToken)
            setUserData(result.user)

            console.log('Google login successful, redirecting to nuggets page')
            // Track successful login
            trackUserLogin('google')
            // Redirect to nuggets page
            router.push('/nuggets')
        } catch (error: any) {
            console.error('Google login error:', error)
            setErrors({
                general: error.data?.message || error.message || 'Google login failed. Please try again.'
            })
        } finally {
            setIsGoogleAuthInProgress(false)
        }
    }

    const handleGoogleAuth = () => {
        setIsGoogleAuthInProgress(true)
        window.location.href = getGoogleAuthUrl('login')
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
        <div className="flex items-center justify-center px-3 sm:px-6 lg:px-7 mt-20 mb-26">
            <div className="max-w-sm w-full space-y-12">

                <div
                    className="
      hidden md:flex absolute 
left-0 right-0 
       h-[200%] 
      bg-cover bg-center bg-no-repeat 
      bg-[url('/background-image2.png')] 
      opacity-10 dark:opacity-5
  "
                    style={{
                        transform: "scaleY(-1)",
                        zIndex: -50,
                        top: '-100px'
                    }}

                ></div>
                {/* Header */}
                <div className="text-center">
                    {/* <div className="flex justify-center">
                        {mounted ? (
                            <Image src={theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} alt="logo" width={100} height={100} />
                        ) : (
                            <Image src="/logo-small.webp" alt="logo" width={100} height={100} />
                        )}
                    </div> */}

                    <h2 className='text-5xl'>Login</h2>
                    <p className="mt-6">
                        Log in to continue with premium access
                    </p>
                </div>

                {/* Login Form */}
                <div className="rounded-lg shadow-lg border border-border p-8 pt-12 pb-12">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* General Error Message */}
                        {errors.general && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <p className="text-sm text-destructive">{errors.general}</p>
                            </div>
                        )}

                        {/* Email/Username Field */}
                        <div>
                            <label htmlFor="emailOrUsername" className="block text-sm mb-2">
                                Email / Username
                            </label>
                            <div className="relative">
                                <input
                                    id="emailOrUsername"
                                    name="emailOrUsername"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    disabled={isGoogleAuthInProgress}
                                    value={formData.emailOrUsername}
                                    onChange={handleInputChange}
                                    className={`appearance-none relative block w-full pl-4 pr-3 dark:bg-[#262829] py-3 border ${errors.emailOrUsername ? 'border-destructive' : 'border-input'
                                        } placeholder-muted-foreground text-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-[#E64A30] focus:border-[#E64A30] bg-background/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed *:`}
                                    placeholder="Enter your email or username"
                                />
                            </div>
                            {errors.emailOrUsername && (
                                <p className="mt-1 text-sm text-destructive">{errors.emailOrUsername}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    disabled={isGoogleAuthInProgress}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`appearance-none relative block w-full pl-4 pr-10 dark:bg-[#262829] py-3 border ${errors.password ? 'border-destructive' : 'border-input'
                                        } placeholder-muted-foreground text-foreground rounded-full  focus:outline-none focus:ring-2 focus:ring-[#E64A30] focus:border-[#E64A30] bg-background/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    disabled={isGoogleAuthInProgress}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    disabled={isGoogleAuthInProgress}
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                    className="h-3 w-3 text-primary focus:ring-ring border-input rounded disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#262829"
                                />
                                <label htmlFor="rememberMe" className="ml-1 block text-sm text-muted-foreground hover:cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link
                                    href="/forgot-password"
                                    className="font-medium text-[#E64A30] hover:underline transition-colors"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className='pt-4'>
                            <button
                                type="submit"
                                disabled={isLoading || isGoogleAuthInProgress}
                                className="group relative w-full flex justify-center py-2 px-4 text-white border border-transparent font-medium rounded-full bg-[#E64A30] hover:scale-100 hover:cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                                        Signing in...
                                    </div>
                                ) : isGoogleAuthInProgress ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                                        Signing in with Google...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                            </div>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={handleGoogleAuth}
                            disabled={isGoogleLoading || isLoading}
                            className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-full shadow-sm bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground hover:cursor-pointer transition-colors disabled:opacity-50 "
                        >
                            {isGoogleLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                                    Signing in with Google...
                                </div>
                            ) : (
                                <>
                                    <Image src='/google-colored.svg' alt='Google SVG' width={16} height={16} loader={({ src }) => src}/>
                                    <span className="ml-2">Continue with Google</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{'  '}
                        <Link href="/subscribe" className="font-medium text-[#E64A30] hover:underline transition-colors">
                            Subscribe now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

