'use client'

import { useState, useEffect, useRef } from 'react'
import { Mail, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {useRequestOtpMutation, useVerifyOtpMutation, useResetPasswordMutation,} from '@/lib/services/authApi'

type Step = 'email' | 'otp' | 'reset' | 'success'

export default function ForgotPassword() {
    const pathname = usePathname();
    const [currentStep, setCurrentStep] = useState<Step>('email')
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [timer, setTimer] = useState(600) // 10 minutes in seconds
    const [isTimerActive, setIsTimerActive] = useState(false)
    const [otpToken, setOtpToken] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        otp: ['', '', '', '', '', ''],
        newPassword: '',
    })
    const [errors, setErrors] = useState<{[key: string]: string}>({})

    const { theme } = useTheme()
    const router = useRouter()
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

    // API hooks
    const [requestOtp] = useRequestOtpMutation()
    const [verifyOtp] = useVerifyOtpMutation()
    const [resetPassword] = useResetPasswordMutation()

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1)
            }, 1000)
        } else if (timer === 0) {
            setIsTimerActive(false)
        }
        return () => clearInterval(interval)
    }, [isTimerActive, timer])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const validateEmail = () => {
        const newErrors: {[key: string]: string} = {}
        
        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateOtp = () => {
        const otpString = formData.otp.join('')
        if (otpString.length !== 6) {
            setErrors({ otp: 'Please enter complete 6-digit OTP' })
            return false
        }
        setErrors({})
        return true
    }

    const validatePassword = () => {
        const newErrors: {[key: string]: string} = {}
        
        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required'
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters long'
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateEmail()) return
        
        setIsLoading(true)
        
        try {
            const result = await requestOtp({ email: formData.email }).unwrap()
            console.log('OTP sent:', result)
            setCurrentStep('otp')
            setTimer(600) // Reset timer to 10 minutes
            setIsTimerActive(true)
        } catch (error: any) {
            console.error('Failed to send OTP:', error)
            setErrors({ general: error?.data?.message || 'Failed to send OTP. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateOtp()) return
        
        setIsLoading(true)
        
        try {
            const otpString = formData.otp.join('')
            const result = await verifyOtp({ 
                email: formData.email,
                otp: otpString
            }).unwrap()
            console.log('OTP verified:', result)
            setOtpToken(otpString) // Store token for password reset
            setCurrentStep('reset')
            setIsTimerActive(false)
        } catch (error: any) {
            console.error('Failed to verify OTP:', error)
            setErrors({ general: error?.data?.message || 'Invalid OTP. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validatePassword()) return
        
        setIsLoading(true)
        
        try {
            const result = await resetPassword({
                email: formData.email,
                otp: otpToken,
                newPassword: formData.newPassword,
                confirmPassword: confirmPassword
            }).unwrap()
            console.log('Password reset successful:', result)
            setCurrentStep('success')
        } catch (error: any) {
            console.error('Failed to reset password:', error)
            setErrors({ general: error?.data?.message || 'Failed to reset password. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return // Prevent multiple characters
        
        const newOtp = [...formData.otp]
        newOtp[index] = value
        setFormData(prev => ({ ...prev, otp: newOtp }))
        
        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
        
        // Clear error when user starts typing
        if (errors.otp) {
            setErrors(prev => ({ ...prev, otp: '' }))
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    const handleResendOtp = async () => {
        setIsLoading(true)
        try {
            await requestOtp({ email: formData.email }).unwrap()
            setTimer(600) // Reset timer
            setIsTimerActive(true)
            setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }))
            setErrors({})
        } catch (error: any) {
            setErrors({ general: error?.data?.message || 'Failed to resend OTP. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackToLogin = () => {
        router.push('/login')
    }

    const getStepTitle = () => {
        switch (currentStep) {
            case 'email': return 'Forgot your password?'
            case 'otp': return 'Enter verification code'
            case 'reset': return 'Create new password'
            case 'success': return 'Password changed successfully!'
            default: return 'Forgot your password?'
        }
    }

    const getStepDescription = () => {
        switch (currentStep) {
            case 'email': return 'No worries, we\'ll send you reset instructions.'
            case 'otp': return `We've sent a 6-digit code to ${formData.email}`
            case 'reset': return 'Enter your new password below'
            case 'success': return 'Your password has been successfully changed!'
            default: return 'No worries, we\'ll send you reset instructions.'
        }
    }

    return (
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-28 mb-44">
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
                   
                    <h1 className="mt-6 text-2xl font-bold text-foreground">
                        {getStepTitle()}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {getStepDescription()}
                    </p>
                </div>

                {/* Form Container */}
                <div className="rounded-lg shadow-lg border border-border p-8 pt-12 pb-12">
                    {/* Email Step */}
                    {currentStep === 'email' && (
                        <form className="space-y-6" onSubmit={handleEmailSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`appearance-none relative block w-full pl-4 pr-3 py-3 border ${
                                        errors.email ? 'border-destructive' : 'border-input'
                                    } placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring focus:ring-ring focus:border-transparent bg-background/20 transition-colors`}
                                    placeholder="Enter your email address"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            {errors.general && (
                                <div className="rounded-md bg-destructive/10 p-4">
                                    <p className="text-sm text-destructive">{errors.general}</p>
                                </div>
                            )}

                            <div className='pt-4'>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative w-full flex justify-center py-2 px-4 text-white border border-transparent font-medium rounded-lg bg-red-800 hover:scale-101 hover:cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                                            Sending OTP...
                                        </div>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* OTP Step */}
                    {currentStep === 'otp' && (
                        <form className="space-y-6" onSubmit={handleOtpSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-card-foreground mb-4 text-center">
                                    Enter 6-digit code
                                </label>
                                <div className="flex justify-center space-x-2">
                                    {formData.otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => {
                                                if (el) {
                                                    otpRefs.current[index] = el
                                                }
                                            }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-12 text-center text-lg font-bold border border-input rounded-md focus:outline-none focus:ring focus:ring-ring focus:border-transparent bg-background/20 transition-colors"
                                        />
                                    ))}
                                </div>
                                {errors.otp && (
                                    <p className="mt-2 text-sm text-destructive text-center">{errors.otp}</p>
                                )}
                            </div>

                            {/* Timer */}
                            <div className="text-center">
                                {isTimerActive ? (
                                    <p className="text-sm text-muted-foreground">
                                        Code expires in: <span className="font-medium text-foreground">{formatTime(timer)}</span>
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isLoading}
                                            className="text-sm font-medium text-primary hover:text-red-800 transition-colors disabled:opacity-50"
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                )}
                            </div>

                            {errors.general && (
                                <div className="rounded-md bg-destructive/10 p-4">
                                    <p className="text-sm text-destructive">{errors.general}</p>
                                </div>
                            )}

                            <div className='pt-4'>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative w-full flex justify-center py-2 px-4 text-white border border-transparent font-medium rounded-lg bg-red-800 hover:scale-101 hover:cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                                            Verifying...
                                        </div>
                                    ) : (
                                        'Verify OTP'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Password Reset Step */}
                    {currentStep === 'reset' && (
                        <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-card-foreground mb-2">
                                    New password
                                </label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className={`appearance-none relative block w-full pl-4 pr-10 py-3 border ${
                                            errors.newPassword ? 'border-destructive' : 'border-input'
                                        } placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring focus:ring-ring focus:border-transparent bg-background/20 transition-colors`}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="mt-1 text-sm text-destructive">{errors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-2">
                                    Confirm new password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`appearance-none relative block w-full pl-4 pr-10 py-3 border ${
                                            errors.confirmPassword ? 'border-destructive' : 'border-input'
                                        } placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring focus:ring-ring focus:border-transparent bg-background/20 transition-colors`}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {errors.general && (
                                <div className="rounded-md bg-destructive/10 p-4">
                                    <p className="text-sm text-destructive">{errors.general}</p>
                                </div>
                            )}

                            <div className='pt-4'>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative w-full flex justify-center py-2 px-4 text-white border border-transparent font-medium rounded-lg bg-red-800 hover:scale-101 hover:cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                                            Updating Password...
                                        </div>
                                    ) : (
                                        'Update Password'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Success Step */}
                    {currentStep === 'success' && (
                        <div className="text-center space-y-6">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    You can now sign in with your new password
                                </p>
                            </div>

                            <div className="pt-4">
                                 <Link
                            href={{
        pathname: '/login',
        query: { redirect: pathname }  // Pass the current path as a query parameter
      }}

                            className="inline-flex items-center text-sm font-medium text-primary hover:text-red-800 transition-colors"
                        >
                           
                            Continue to Login
                        </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Back to Login Link */}
                {currentStep !== 'success' && (
                    <div className="text-center">
                        <Link
                            href={{
        pathname: '/login',
        query: { redirect: pathname }  // Pass the current path as a query parameter
      }}

                            className="inline-flex items-center text-sm font-medium text-primary hover:text-red-800 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

