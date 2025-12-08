import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../lib/hooks/useAuth';
import { useGetDiscordLoginUrlQuery, useGetDiscordStatusQuery } from '../../lib/services/discordApi';

const DiscordButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();

    const { data: loginUrlData, isLoading: loginUrlLoading } = useGetDiscordLoginUrlQuery(undefined, {
        skip: !token
    });

    const { data: discordStatus, isLoading: statusLoading } = useGetDiscordStatusQuery(undefined, {
        skip: !token
    });

    const handleDiscordConnect = async () => {
        if (!loginUrlData?.url) return;
        try {
            setIsLoading(true);
            window.location.href = loginUrlData.url;
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (loginUrlLoading || statusLoading) {
        return (
            <button
                disabled
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#F6BCB2] text-black text-sm sm:text-md py-2 sm:px-4 rounded-full transition-colors duration-200 cursor-not-allowed"
            >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Loading...
            </button>
        );
    }

    // Connected state
    if (discordStatus?.connected) {
        return (
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#F6BCB2] text-black text-sm sm:text-md py-2 sm:px-4 rounded-full transition-colors duration-200 cursor-not-allowed"
                >
                    <Image src="/discord-icon.svg" alt="Discord" width={20} height={20} loader={({ src }) => src}/>
                    Connected
                </button>
                <span className="text-xs text-black sm:inline">{discordStatus.discordUsername}</span>
            </div>
        );
    }

    // Default connect button
    return (
        <button
            onClick={handleDiscordConnect}
            disabled={isLoading || !loginUrlData?.url}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#F6BCB2] text-black text-sm sm:text-md py-2 sm:px-4 rounded-full transition-colors duration-200 hover:bg-[#E6AC95] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Image src="/discord-icon.svg" alt="Discord" width={20} height={20} loader={({ src }) => src}/>
            {isLoading ? 'Connecting...' : 'Connect with Discord'}
        </button>
    );
};

export default DiscordButton;
