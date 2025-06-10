'use client'

import { useState, useEffect } from 'react'
import { Mail, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import Link from 'next/link'

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        email: ''
    })
    const [errors, setErrors] = useState<{[key: string]: string}>({})

    const { theme } = useTheme()

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {}
        
        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) return
        
        setIsLoading(true)
        
        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 2000))
            console.log('Password reset request:', formData)
            setIsSubmitted(true)
            // Handle successful password reset request here
        } catch (error) {
            console.error('Password reset error:', error)
            setErrors({ general: 'Failed to send password reset email. Please try again.' })
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

    const handleTryAgain = () => {
        setIsSubmitted(false)
        setFormData({ email: '' })
        setErrors({})
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
                   
                    <h1 className="mt-6 text-2xl font-bold text-foreground">
                        {isSubmitted ? 'Check your email' : 'Forgot your password?'}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isSubmitted 
                            ? `We've sent a password reset link to ${formData.email}`
                            : 'No worries, we\'ll send you reset instructions.'
                        }
                    </p>
                </div>

                {/* Form or Success Message */}
                <div className="bg-card rounded-lg shadow-lg border border-border p-8 pt-12 pb-12">
                    {isSubmitted ? (
                        // Success State
                        <div className="text-center space-y-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
                                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Didn't receive the email? Check your spam folder or
                                </p>
                                <button
                                    onClick={handleTryAgain}
                                    className="text-sm font-medium text-primary hover:text-red-800 transition-colors"
                                >
                                    try another email address
                                </button>
                            </div>

                            <div className="pt-4">
                                <Link
                                    href="/login"
                                    className="group relative w-full flex justify-center py-2 px-4 text-white border border-transparent font-medium rounded-lg bg-red-800 hover:scale-101 hover:cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                    Back to login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        // Form State
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>
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
                                        } placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background transition-colors`}
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            {/* General Error */}
                            {errors.general && (
                                <div className="rounded-md bg-destructive/10 p-4">
                                    <p className="text-sm text-destructive">{errors.general}</p>
                                </div>
                            )}

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
                                            Sending reset link...
                                        </div>
                                    ) : (
                                        'Send reset link'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Back to Login Link */}
                {!isSubmitted && (
                    <div className="text-center">
                        <Link
                            href="/login"
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

