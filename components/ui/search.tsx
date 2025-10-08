"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
    placeholder?: string;
    size?: "sm" | "md" | "lg";
    design?: string; // input styling
    width?: string; // Tailwind width classes
    className?: string; // outer wrapper custom classes
    onChange?: (value: string) => void;
    buttonLabel?: string;
    onButtonClick?: () => void;
}

export default function SearchBar({
    placeholder = "Search...",
    size = "md",
    design = "",
    width = "w-full",
    className = "",
    onChange,
    buttonLabel,
    onButtonClick,
}: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const sizeClasses =
        size === "sm"
            ? "py-1.5 text-sm"
            : size === "lg"
                ? "py-4 text-lg"
                : "py-3 text-base";

    const handleChange = (value: string) => {
        setSearchTerm(value);
        onChange?.(value);
    };

    return (
        <div className={`mb-8 flex ${width} ${className}`}>
            <div className="relative w-full">
                {/* Search Icon */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                {/* Input */}
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => handleChange(e.target.value)}
                    className={`filter-input w-full pl-10 ${buttonLabel ? "pr-24" : "pr-10"
                        } rounded-full shadow-sm placeholder:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent ${sizeClasses} ${design}`}
                />

                {/* Clear Button */}
                {searchTerm && !buttonLabel && (
                    <button
                        type="button"
                        onClick={() => handleChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 focus:outline-none"
                        aria-label="Clear search"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Optional Action Button (inside input) */}
                {buttonLabel && (
                    <button
                        type="button"
                        onClick={onButtonClick}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-white text-sm rounded-2xl"
                        style={{ backgroundColor: "#E64A30" }}
                    >
                        {buttonLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
