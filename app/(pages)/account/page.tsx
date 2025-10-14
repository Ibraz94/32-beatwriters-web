'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { User, Mail, Lock, Crown, Eye, EyeOff, Calendar, Shield, LogOut, Edit2, Check, X, CreditCard, AlertTriangle, Badge } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../lib/hooks/useAuth'
import { useUpdateProfileMutation, useUpdatePasswordMutation, useGetProfileQuery, useLogoutMutation } from '../../../lib/services/authApi'
import { useGetDiscordStatusQuery } from '../../../lib/services/discordApi'
import DiscordButton from '@/app/components/DiscordButton'
import { buildApiUrl, API_CONFIG } from '../../../lib/config/api'
import { setAuthTokens } from '../../../lib/utils/auth'

function AccountContent() {
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})
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
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [successMessage, setSuccessMessage] = useState('')
    const [subscription, setSubscription] = useState<any>(null)
    const [loadingSubscription, setLoadingSubscription] = useState(false)
    const [cancellingSubscription, setCancellingSubscription] = useState(false)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()

    const { theme } = useTheme()
    const { user, logout, updateProfile, token } = useAuth()
    const [updateProfileMutation] = useUpdateProfileMutation()
    const [updatePasswordMutation] = useUpdatePasswordMutation()
    const [logoutMutation] = useLogoutMutation()

    // Fetch fresh profile data
    const { data: profileData, error: profileError, isLoading: profileLoading } = useGetProfileQuery()

    // Fetch Discord status
    const { data: discordStatus, isLoading: discordStatusLoading } = useGetDiscordStatusQuery(undefined, {
        skip: !token
    })

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

    // Handle Discord OAuth callback
    useEffect(() => {
        // Console log the full searchParams object
        console.log('Full searchParams object:', searchParams)

        const discordStatus = searchParams.get('discord')

        if (discordStatus === 'success') {
            const username = searchParams.get('username')

            console.log('Discord connection successful!')
            setSuccessMessage(`Successfully connected to Discord as ${username || 'user'}!`)

            // Clean up URL parameters
            router.replace('/account', { scroll: false })
        } else if (discordStatus === 'error') {
            const errorMessage = searchParams.get('message') || 'Failed to connect to Discord'
            setErrors({ discord: errorMessage })

            // Clean up URL parameters
            router.replace('/account', { scroll: false })
        }
    }, [searchParams, router])

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
        const newErrors: { [key: string]: string } = {}

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
            await updatePasswordMutation({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
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

    // Fetch subscription information
    const fetchSubscription = async () => {
        setLoadingSubscription(true)
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.MY_SUBSCRIPTION), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })

            if (response.ok) {
                const data = await response.json()

                if (data.success && data.data?.subscription) {
                    const stripeSubscription = data.data.subscription
                    const userData = data.data.user

                    // Map the Stripe subscription data to the expected format
                    const mappedSubscription = {
                        subscriptionId: stripeSubscription.id,
                        status: stripeSubscription.status,
                        planName: stripeSubscription.items?.data?.[0]?.price?.product?.name || userData.membershipType || 'Premium Plan',
                        amount: stripeSubscription.plan?.amount || stripeSubscription.items?.data?.[0]?.price?.unit_amount,
                        interval: stripeSubscription.plan?.interval || stripeSubscription.items?.data?.[0]?.price?.recurring?.interval,
                        currentPeriodEnd: stripeSubscription.items?.data?.[0]?.current_period_end,
                        // Handle next billing date for both active and cancelled subscriptions
                        nextBillingDate: stripeSubscription.cancel_at_period_end
                            ? stripeSubscription.cancel_at
                            : stripeSubscription.items?.data?.[0]?.current_period_end,
                        // Additional useful data
                        customerEmail: stripeSubscription.customer?.email,
                        membershipType: userData.membershipType,
                        subscriptionEndDate: userData.subscriptionEndDate,
                        // Add cancellation info
                        isCancelled: stripeSubscription.cancel_at_period_end,
                        cancelAtDate: stripeSubscription.cancel_at,
                        cancelledAt: stripeSubscription.canceled_at
                    }

                    console.log('Mapped subscription data:', mappedSubscription)
                    setSubscription(mappedSubscription)
                } else {
                    setSubscription(null)
                }
            } else {
                const errorData = await response.json()
                setErrors({ subscription: errorData.message || 'Failed to fetch subscription data' })
            }
        } catch (error) {
            setErrors({ subscription: 'Failed to fetch subscription data' })
        } finally {
            setLoadingSubscription(false)
        }
    }

    // Cancel subscription
    const handleCancelSubscription = async () => {
        setCancellingSubscription(true)
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STRIPE.CANCEL_SUBSCRIPTION), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })

            if (response.ok) {
                setSuccessMessage('Subscription cancelled successfully. You will retain access until the end of your billing period.')
                setShowCancelConfirm(false)
                fetchSubscription() // Refresh subscription data
                setTimeout(() => setSuccessMessage(''), 5000)
            } else {
                const errorData = await response.json()
                setErrors({ subscription: errorData.message || 'Failed to cancel subscription' })
            }
        } catch (error) {
            setErrors({ subscription: 'Failed to cancel subscription' })
        } finally {
            setCancellingSubscription(false)
        }
    }

    // Fetch subscription data when subscription tab is active
    useEffect(() => {
        if (activeTab === 'subscription' && !subscription && !loadingSubscription) {
            fetchSubscription()
        }
    }, [activeTab])

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
            <section className="container mx-auto mt-8 px-4 min-h-screen">
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
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto mt-8">
                <div className='relative'>
                    <div
                        className="
      hidden md:flex absolute 
 left-1/2 -translate-x-1/2 
      w-screen h-[400%] 
      bg-cover bg-center bg-no-repeat 
      bg-[url('/background-image2.png')] 
      opacity-10 dark:opacity-5
    "
                        style={{
                            transform: "scaleY(-1)", // keeps it upside down
                            zIndex: -50,
                            top: '-130px'
                        }}
                    ></div>

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

                    {/* Discord Error Message */}
                    {errors.discord && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
                            <p className="text-red-800 dark:text-red-400">{errors.discord}</p>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="mb-8">
                        {/* Container */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-2 border border-[#C7C8CB] rounded-full p-1 bg-white dark:bg-[#262829]">

                            {/* Tabs: always visible */}
                            <nav className="flex space-x-2 overflow-x-auto">
                                {[
                                    { id: 'profile', label: 'Profile', icon: User },
                                    { id: 'update-password', label: 'Update Password', icon: Shield },
                                    { id: 'subscription', label: 'Subscription', icon: CreditCard }
                                ].map(({ id, label, icon: Icon }) => {
                                    const isActive = activeTab === id;
                                    const textColor = isActive ? 'text-white' : 'text-[#72757C]';
                                    const bgColor = isActive ? 'bg-[#E64A30]' : 'bg-transparent';
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setActiveTab(id)}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-sm transition-colors ${bgColor} ${textColor} whitespace-nowrap`}
                                        >
                                            <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#72757C]'}`} />
                                            <span>{label}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Discord Button for md and above */}
                            <div className="hidden md:block w-auto">
                                <div className="rounded-full overflow-hidden">
                                    <DiscordButton />
                                </div>
                            </div>
                        </div>

                        {/* Discord Button for sm and below */}
                        <div className="flex justify-center mt-2 md:hidden w-full">
                            <div className="rounded-full overflow-hidden w-1/2 sm:w-auto">
                                <DiscordButton />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="rounded-lg shadow-sm border border-border p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <label className="text-sm font-medium">
                                            Full Name
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background/20">
                                        {editMode.name ? (
                                            <div className="flex-1 flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={profileForm.name}
                                                    onChange={handleProfileChange}
                                                    className="flex-1 border-none outline-none text-foreground"
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
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <label className="text-sm font-medium">
                                            Email Address
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background/20">
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
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <label className="text-sm font-medium">
                                            Member Since
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background/20">
                                        <span className="text-foreground">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Account Status */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Crown className="h-5 w-5 text-yellow-500" />
                                        <label className="text-sm font-medium">
                                            Membership Status
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background/20">
                                        <span className="text-foreground">
                                            {user.memberships.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Account Status */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="h-5 w-5 text-red-800" />
                                        <label className="text-sm font-medium">
                                            Account Status
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background/20">
                                        <span className="text-foreground">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Discord Connection Status */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg
                                            className="h-5 w-5 text-[#1D212D]"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                        </svg>
                                        <label className="text-sm font-medium">
                                            Discord Connection
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background/20">
                                        <span className="text-foreground">
                                            {discordStatusLoading ? (
                                                <span className="text-muted-foreground">Loading...</span>
                                            ) : discordStatus?.connected ? (
                                                <span className="text-green-600 dark:text-green-400">
                                                    Connected as {discordStatus.discordUsername}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">Not connected</span>
                                            )}
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

                            <form
                                onSubmit={handlePasswordSubmit}
                                className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">

                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                        <label htmlFor="currentPassword" className="text-sm font-medium">
                                            Current Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        </div>
                                        <input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full pl-10 pr-10 py-3 border ${errors.currentPassword ? 'border-destructive' : 'border-input'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background/20`}
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
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                        <label htmlFor="newPassword" className="text-sm font-medium">
                                            New Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        </div>
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full pl-10 pr-10 py-3 border ${errors.newPassword ? 'border-destructive' : 'border-input'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background/20`}
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
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                                            Confirm New Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-destructive' : 'border-input'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background/20`}
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
                                    className="w-full md:w-auto px-6 py-3 bg-[#E64A30] text-white rounded-full hover:scale-102 hover:cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Subscription Tab */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-foreground">Subscription Management</h2>

                            {loadingSubscription ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
                                </div>
                            ) : subscription ? (
                                <div className="space-y-6">
                                    {/* Subscription Status */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                                <label className="text-sm font-medium">
                                                    Plan
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between p-3 border border-input rounded-lg bg-background/20">
                                                <span className="text-foreground font-medium">
                                                    {subscription.planName || 'Premium Plan'}
                                                </span>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${subscription.isCancelled
                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                        : subscription.status === 'active'
                                                            ? 'bg-[#E64A30] text-white dark:bg-[#E64A30] dark:text-white'
                                                            : subscription.status === 'canceled'
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                        }`}
                                                >
                                                    {subscription.isCancelled
                                                        ? 'Active (Cancelled)'
                                                        : subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1)}
                                                </span>
                                            </div>

                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                                <label className="block text-sm font-medium mb-2">
                                                    Amount
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background/20">
                                                <span className="text-foreground">
                                                    ${subscription.amount ? (subscription.amount / 100).toFixed(2) : '0.00'} / {subscription.interval || 'month'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <label className="block text-sm font-medium mb-2">
                                                    {subscription.isCancelled ? 'Access Until' : 'Next Billing Date'}
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background/20">
                                                <span className="text-foreground">
                                                    {subscription.nextBillingDate
                                                        ? new Date(subscription.nextBillingDate * 1000).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </span>
                                                {subscription.isCancelled && (
                                                    <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded">
                                                        Cancelled
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Shield className="h-5 w-5 text-muted-foreground" />
                                                <label className="block text-sm font-medium mb-2">
                                                    Subscription ID
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-3 p-3 border border-input rounded-lg bg-background/20">
                                                <span className="text-foreground text-sm font-mono">
                                                    {subscription.subscriptionId ? subscription.subscriptionId.slice(-8) : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Cancel Subscription Section */}
                                    {subscription.status === 'active' && !subscription.isCancelled && (
                                        <div className="rounded-lg p-6 border transition-colors
                    bg-[#FFE6E2] border-[#E64A30] dark:bg-[#262829] dark:border-[#72757C]">
                                            <div className="flex items-start space-x-3">
                                                <AlertTriangle className="h-5 w-5 text-[#E64A30] dark:text-white mt-0.5" />
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-[#E64A30] dark:text-white">
                                                        Cancel Subscription
                                                    </h3>
                                                    <p className="mt-2 text-sm text-[#E64A30] dark:text-[#C7C8CB]">
                                                        Cancelling your subscription will stop all future charges. You will retain access to premium features until the end of your current billing period.
                                                    </p>

                                                    {!showCancelConfirm ? (
                                                        <button
                                                            onClick={() => setShowCancelConfirm(true)}
                                                            className="mt-4 px-6 py-2 bg-[#E64A30] text-white rounded-full hover:bg-red-700 transition-colors"
                                                        >
                                                            Cancel Subscription
                                                        </button>
                                                    ) : (
                                                        <div className="mt-4 space-y-3">
                                                            <p className="text-sm font-medium text-[#E64A30] dark:text-white">
                                                                Are you sure you want to cancel your subscription?
                                                            </p>
                                                            <div className="flex space-x-3">
                                                                <button
                                                                    onClick={handleCancelSubscription}
                                                                    disabled={cancellingSubscription}
                                                                    className="px-6 py-2 bg-[#E64A30] text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {cancellingSubscription ? (
                                                                        <div className="flex items-center">
                                                                            <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                                            Cancelling...
                                                                        </div>
                                                                    ) : (
                                                                        'Yes, Cancel'
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => setShowCancelConfirm(false)}
                                                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-colors"
                                                                >
                                                                    Keep Subscription
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No Active Subscription</h3>
                                    <p className="text-muted-foreground mb-4">
                                        You don't have an active subscription. Subscribe to access premium features.
                                    </p>
                                    <a
                                        href="/subscribe"
                                        className="inline-flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Subscribe Now
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default function Account() {
    return (
        <Suspense fallback={
            <section className="container mx-auto mt-24 px-4">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800"></div>
                </div>
            </section>
        }>
            <AccountContent />
        </Suspense>
    )
}
