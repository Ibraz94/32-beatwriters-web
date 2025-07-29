import { useState } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { useGetDiscordLoginUrlQuery, useGetDiscordStatusQuery } from '../../lib/services/discordApi';

const DiscordButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();
    
    // Get Discord login URL and status
    const { data: loginUrlData, isLoading: loginUrlLoading } = useGetDiscordLoginUrlQuery(undefined, {
        skip: !token
    });
    
    const { data: discordStatus, isLoading: statusLoading } = useGetDiscordStatusQuery(undefined, {
        skip: !token
    });
    
    const handleDiscordConnect = async () => {
        if (!loginUrlData?.url) {
            console.error('No Discord login URL available');
            return;
        }
        
        try {
            setIsLoading(true);
            // Redirect to Discord OAuth
            window.location.href = loginUrlData.url;
        } catch (error) {
            console.error('Error connecting to Discord:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = () => {
        // TODO: Implement disconnect functionality if needed
        console.log('Disconnect Discord - not implemented yet');
    };

    // Show loading state
    if (loginUrlLoading || statusLoading) {
        return (
            <button
                disabled
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-400 text-white text-sm sm:text-md py-2 sm:px-2 rounded transition-colors duration-200 cursor-not-allowed"
            >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
            </button>
        );
    }

    // If already connected to Discord
    if (discordStatus?.connected) {
        return (
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                    disabled
                    className="flex items-center justify-center gap-2 bg-green-600 text-white text-sm sm:text-md py-2 px-2 rounded transition-colors duration-200 cursor-not-allowed"
                >
                    <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    Connected
                </button>
                <span className="text-xs text-muted-foreground sm:inline">
                    {discordStatus.discordUsername}
                </span>
            </div>
        );
    }

    // Default connect button
    return (
        <button
            onClick={handleDiscordConnect}
            disabled={isLoading || !loginUrlData?.url}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm sm:text-md py-2 sm:px-2 rounded transition-colors duration-200 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            {isLoading ? 'Connecting...' : 'Connect with Discord'}
        </button>
    );
};

export default DiscordButton; 