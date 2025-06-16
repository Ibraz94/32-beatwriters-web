'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Lock, CreditCard, Crown, Eye, EyeOff, Calendar, Shield, LogOut, Edit2, Check, X } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useAuth } from '../../../lib/hooks/useAuth'
import { useUpdateProfileMutation, useResetPasswordMutation, useGetProfileQuery,  useLogoutMutation } from '../../../lib/services/authApi'
import DiscordButton from '@/app/components/DiscordButton'

export default function Account() {
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState<{[key: string]: boolean}>({})
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        firstName: '',
        lastName: ''
    })
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState<{[key: string]: string}>({})
    const [successMessage, setSuccessMessage] = useState('')

    const { theme } = useTheme()
    const { user, logout, updateProfile } = useAuth()
    const [updateProfileMutation] = useUpdateProfileMutation()
    const [resetPasswordMutation] = useResetPasswordMutation()
    const [logoutMutation] = useLogoutMutation()

    // Fetch fresh profile data
    const { data: profileData, error: profileError, isLoading: profileLoading } = useGetProfileQuery()

    // Helper function to get display name from user data
    const getDisplayName = (userData: typeof user) => {
        if (!userData) return ''
        
        let displayName = userData.username || ''
        if (!displayName && (userData.firstName || userData.lastName)) {
            displayName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
        }
        if (!displayName && userData.email) {
            displayName = userData.email.split('@')[0]
        }
        return displayName
    }

    useEffect(() => {
        setMounted(true)
        
        // Use fresh profile data if available, otherwise fall back to user from auth context
        const currentUser = profileData?.user || user
        
        if (currentUser) {
            console.log('User data received:', currentUser) // Debug log
            console.log('Profile data:', profileData) // Debug log
            
            // Construct name from available data
            let displayName = getDisplayName(currentUser)
            
            setProfileForm({
                name: displayName,
                email: currentUser.email || '',
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || ''
            })
            
            console.log('Profile form set to:', {
                name: displayName,
                email: currentUser.email || '',
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || ''
            }) // Debug log
        }
    }, [user, profileData])

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setProfileForm(prev => ({
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

    const toggleEditMode = (field: string) => {
        setEditMode(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
        setErrors({})
    }

    const handleProfileSubmit = async (field: string) => {
        if (!user) return
        
        setIsLoading(true)
        
        try {
            const updateData: any = {}
            if (field === 'name') {
                updateData.name = profileForm.name
            } else if (field === 'email') {
                updateData.email = profileForm.email
            } else if (field === 'firstName') {
                updateData.firstName = profileForm.firstName
            } else if (field === 'lastName') {
                updateData.lastName = profileForm.lastName
            }

            const result = await updateProfileMutation(updateData).unwrap()
            
            // Update local state
            updateProfile(updateData)
            
            setSuccessMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`)
            setEditMode(prev => ({ ...prev, [field]: false }))
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error: any) {
            setErrors({ [field]: error?.data?.message || `Failed to update ${field}. Please try again.` })
        } finally {
            setIsLoading(false)
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
            await resetPasswordMutation({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword
            }).unwrap()
            
            setSuccessMessage('Password updated successfully!')
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error: any) {
            setErrors({ general: error?.data?.message || 'Failed to update password. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const cancelEdit = (field: string) => {
        setEditMode(prev => ({ ...prev, [field]: false }))
        if (user) {
            if (field === 'name') {
                setProfileForm(prev => ({
                    ...prev,
                    [field]: getDisplayName(user)
                }))
            } else {
                setProfileForm(prev => ({
                    ...prev,
                    [field]: user[field as keyof typeof user] as string || ''
                }))
            }
        }
        setErrors({})
    }

    if (!user || profileLoading) {
        return (
            <section className="container mx-auto mt-24 px-4">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800"></div>
                </div>
            </section>
        )
    }

    // Show profile error if any
    if (profileError) {
        console.error('Profile fetch error:', profileError)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto mt-24">
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
                    <p className="text-muted-foreground">Manage your account</p>
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
                                { id: 'update-password', label: 'Update Password', icon: Shield }
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
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Full Name
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        {editMode.name ? (
                                            <div className="flex-1 flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={profileForm.name}
                                                    onChange={handleProfileChange}
                                                    className="flex-1 bg-transparent border-none outline-none text-foreground"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleProfileSubmit('name')}
                                                    disabled={isLoading}
                                                    className="text-green-600 hover:text-green-700 disabled:opacity-50"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => cancelEdit('name')}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="flex-1 text-foreground">{getDisplayName(user)}</span>
                                                <button
                                                    onClick={() => toggleEditMode('name')}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>
                                
                                {/* Email Address */}
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Email Address
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        {editMode.email ? (
                                            <div className="flex-1 flex items-center space-x-2">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={profileForm.email}
                                                    onChange={handleProfileChange}
                                                    className="flex-1 bg-transparent border-none outline-none text-foreground"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleProfileSubmit('email')}
                                                    disabled={isLoading}
                                                    className="text-green-600 hover:text-green-700 disabled:opacity-50"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => cancelEdit('email')}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="flex-1 text-foreground">{user.email}</span>
                                                <button
                                                    onClick={() => toggleEditMode('email')}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>
                                
                                {/* Member Since */}
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Member Since
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-foreground">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Account Status */}
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Account Status
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background">
                                        <Crown className="h-5 w-5 text-yellow-500" />
                                        <span className="text-foreground">
                                            {user.role === 'Administrator' ? 'Admin' : user.role === 'Subscriber' ? 'Premium Member' : 'Free Member'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'update-password' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-foreground">Update Password</h2>
                            
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
                                    className="w-full md:w-auto px-6 py-3 bg-red-800 text-white rounded-lg hover:scale-102 hover:cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                
            </div>
        </div>
    )
}
