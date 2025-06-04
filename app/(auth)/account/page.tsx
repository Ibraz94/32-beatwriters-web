'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Lock, CreditCard, Crown, Settings, Eye, EyeOff, Calendar, Shield, LogOut } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useAuth } from '../../(pages)/articles/hooks/useAuth'

export default function Account() {
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState<{[key: string]: string}>({})
    const [successMessage, setSuccessMessage] = useState('')

    const { theme } = useTheme()
    const { user, loading, signOut } = useAuth()

    // Mock data - in a real app, this would come from your API
    const [userData, setUserData] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        joinDate: '2024-01-15',
        subscription: {
            plan: 'Premium',
            status: 'active',
            nextBilling: '2024-02-15',
            amount: '$19.99'
        },
        paymentMethod: {
            type: 'Visa',
            last4: '4242',
            expiry: '12/26'
        }
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordForm(prev => ({
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

    const validatePasswordForm = () => {
        const newErrors: {[key: string]: string} = {}
        
        if (!passwordForm.currentPassword) {
            newErrors.currentPassword = 'Current password is required'
        }
        
        if (!passwordForm.newPassword) {
            newErrors.newPassword = 'New password is required'
        } else if (passwordForm.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters'
        }
        
        if (!passwordForm.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password'
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validatePasswordForm()) return
        
        setIsLoading(true)
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            setSuccessMessage('Password updated successfully!')
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            setErrors({ general: 'Failed to update password. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = () => {
        signOut()
        window.location.href = '/'
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please log in to access your account</h1>
                    <Link href="/login" className="text-red-800 hover:underline">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        {mounted ? (
                            <Image src={theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} alt="logo" width={80} height={80} />
                        ) : (
                            <Image src="/logo-small.webp" alt="logo" width={80} height={80} />
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your profile and subscription</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg">
                        <p className="text-green-800 dark:text-green-400">{successMessage}</p>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="mb-8">
                    <div className="border-b border-border">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'profile', label: 'Profile', icon: User },
                                { id: 'subscription', label: 'Subscription', icon: Crown },
                                { id: 'payment', label: 'Payment', icon: CreditCard },
                                { id: 'security', label: 'Security', icon: Shield }
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === id
                                            ? 'border-red-800 text-red-800'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Icon className="h-4 w-4" />
                                        <span>{label}</span>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Full Name
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-foreground">{userData.name}</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Email Address
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-foreground">{userData.email}</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Member Since
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-foreground">{new Date(userData.joinDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Account Status
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background">
                                        <Crown className="h-5 w-5 text-yellow-500" />
                                        <span className="text-foreground">{user.isPremium ? 'Premium Member' : 'Free Member'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subscription Tab */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-foreground">Subscription Details</h2>
                            
                            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <Crown className="h-8 w-8 text-red-800" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                                                {userData.subscription.plan} Plan
                                            </h3>
                                            <p className="text-red-700 dark:text-red-300">
                                                Status: {userData.subscription.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                                            {userData.subscription.amount}
                                        </p>
                                        <p className="text-red-700 dark:text-red-300">per month</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-red-800 dark:text-red-200 font-medium">Next Billing Date:</p>
                                        <p className="text-red-700 dark:text-red-300">{new Date(userData.subscription.nextBilling).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-red-800 dark:text-red-200 font-medium">Auto-renewal:</p>
                                        <p className="text-red-700 dark:text-red-300">Enabled</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex space-x-4">
                                <button className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors">
                                    Manage Subscription
                                </button>
                                <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">
                                    View Billing History
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Payment Tab */}
                    {activeTab === 'payment' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-foreground">Payment Information</h2>
                            
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="h-8 w-8 text-blue-800" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                                {userData.paymentMethod.type} •••• {userData.paymentMethod.last4}
                                            </h3>
                                            <p className="text-blue-700 dark:text-blue-300">
                                                Expires: {userData.paymentMethod.expiry}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-sm rounded-full">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex space-x-4">
                                <button className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors">
                                    Update Payment Method
                                </button>
                                <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">
                                    Add New Card
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>
                            
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-card-foreground mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full pl-10 pr-10 py-3 border ${
                                                errors.currentPassword ? 'border-destructive' : 'border-input'
                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background`}
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.currentPassword && (
                                        <p className="mt-1 text-sm text-destructive">{errors.currentPassword}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-card-foreground mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full pl-10 pr-10 py-3 border ${
                                                errors.newPassword ? 'border-destructive' : 'border-input'
                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background`}
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.newPassword && (
                                        <p className="mt-1 text-sm text-destructive">{errors.newPassword}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full pl-10 pr-10 py-3 border ${
                                                errors.confirmPassword ? 'border-destructive' : 'border-input'
                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background`}
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
                                    )}
                                </div>
                                
                                {errors.general && (
                                    <p className="text-sm text-destructive">{errors.general}</p>
                                )}
                                
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full md:w-auto px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            Updating Password...
                                        </div>
                                    ) : (
                                        'Update Password'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}
