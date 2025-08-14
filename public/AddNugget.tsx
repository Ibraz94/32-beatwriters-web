import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { handleApiResponse, ValidationError } from "@/utils/apiInterceptor";
import { ArrowLeft, Plus, X, Search, Loader2 } from "lucide-react";
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions';
import "./nuggets.css";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { EditorConfig } from '@ckeditor/ckeditor5-core';
import '@/styles/ckeditor.css';

interface Player {
    id: number;
    playerId: string;
    name: string;
    team: string | null;
    position: string;
}

const defaultStyle = {
    control: {
        backgroundColor: '#fff',
        fontSize: 16,
        fontWeight: 'normal',
        minHeight: '150px',
        width: '100%',
    },
    input: {
        margin: 0,
        padding: '0.5rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.375rem',
        minHeight: '150px',
        width: '100%',
    },
    suggestions: {
        list: {
            backgroundColor: 'white',
            border: '1px solid rgba(0,0,0,0.15)',
            fontSize: 14,
            zIndex: 50,
        },
        item: {
            padding: '5px 10px',
            borderBottom: '1px solid rgba(0,0,0,0.15)',
            '&focused': {
                backgroundColor: '#f0f0f0',
            },
        },
    },
    highlighter: {
        padding: '0.5rem',
        minHeight: '150px',
    },
    mention: {
        backgroundColor: 'transparent',
        color: '#2563eb',
        textDecoration: 'none',
        cursor: 'pointer',
    },
};

const editorConfig: EditorConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'blockQuote',
            'insertTable',
            'undo',
            'redo'
        ]
    },
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
        ]
    },
    removePlugins: ['Title']
};

const AddNugget: React.FC = () => {
    const navigate = useNavigate();
    const token = useSelector((state: RootState) => state.auth.token);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        content: "",
        fantasyInsight: "",
        playerId: "",
        sourceName: "",
        sourceUrl: "",
        urlIcon: "",
    });

    useEffect(() => {
        const fetchFirstNuggetSources = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/nuggets?limit=1&page=1`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await handleApiResponse(response);
                if (data.data?.nuggets?.length > 0) {
                    const first = data.data.nuggets[0];
                    setFormData(prev => ({
                        ...prev,
                        sourceName: first.sourceName || "",
                        sourceUrl: first.sourceUrl || ""
                    }));
                }
            } catch (error) {
                console.error("Error fetching first nugget:", error);
            }
        };
        fetchFirstNuggetSources();
    }, [token]);



    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch players when search query changes
    useEffect(() => {
        const fetchPlayers = async () => {
            if (!debouncedSearchQuery) {
                setPlayers([]);
                return;
            }

            setIsLoadingPlayers(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/players?search=${debouncedSearchQuery}&limit=10`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await handleApiResponse(response);
                setPlayers(data.data.players);
            } catch (error) {
                console.error("Error fetching players:", error);
                const errorMessage = error instanceof Error ? error.message : "Failed to fetch players";
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                setIsLoadingPlayers(false);
            }
        };

        fetchPlayers();
    }, [debouncedSearchQuery, token, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    };

    /* const handlePlayerSelect = (player: Player) => {
        setSelectedPlayer(player);
        setFormData(prev => ({
            ...prev,
            playerId: player.id.toString()
        }));
        setOpen(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newFile = e.target.files[0];
            if (formData.images.length >= 4) {
                toast({
                    title: "Error",
                    description: "Maximum 4 images allowed",
                    variant: "destructive",
                });
                return;
            }
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, newFile]
            }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    }; */

    const handleMentionChange = (event: any, newValue: string, newPlainTextValue: string, mentions: SuggestionDataItem[]) => {
        console.log('Content Value:', newValue);
        console.log('Plain Text:', newPlainTextValue);
        console.log('Mentions:', mentions);
        setFormData(prev => ({ ...prev, content: newValue }));
    };

    const fetchPlayersForMention = async (query: string, callback: (data: SuggestionDataItem[]) => void) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/players?page=1&limit=10&search=${query}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await handleApiResponse(response);
            const formattedPlayers = data.data.players.map((player: Player) => {
                const idStr = String(player.id);
                return {
                    id: idStr.startsWith('/players/') ? idStr.replace('/players/', '') : idStr,
                    display: player.name,
                };
            });
            callback(formattedPlayers);
        } catch (error) {
            console.error("Error fetching players:", error);
            callback([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.content.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Content is required",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("content", formData.content);
            formDataToSend.append("fantasyInsight", formData.fantasyInsight);
            formDataToSend.append("playerId", formData.playerId);

            if (formData.sourceName) {
                formDataToSend.append("sourceName", formData.sourceName);
            }
            if (formData.sourceUrl) {
                formDataToSend.append("sourceUrl", formData.sourceUrl);
            }
            if (formData.urlIcon) {
                formDataToSend.append("urlIcon", formData.urlIcon);
            }
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/nuggets`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formDataToSend,
                }
            );

            const data = await handleApiResponse(response);

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Nugget created successfully",
                });
                navigate("/admin/nuggets");
            } else {
                throw new Error(data.message || "Failed to create nugget");
            }
        } catch (error) {
            console.error("Error creating nugget:", error);

            if (error instanceof ValidationError) {
                // Handle validation errors
                const validationMessages = error.errors.map(err => err.msg).join('\n');
                toast({
                    title: "Validation Error",
                    description: validationMessages,
                    variant: "destructive",
                });
            } else {
                // Handle other errors (including JWT expiration)
                const errorMessage = error instanceof Error ? error.message : "Failed to create nugget";
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/admin/nuggets")}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-2xl font-bold">Add New Nugget</h1>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Player</label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {selectedPlayer ? (
                                            <div className="flex items-center gap-2">
                                                {selectedPlayer.name}
                                                <span className="text-sm text-gray-500">
                                                    ({selectedPlayer.team || 'No Team'})
                                                </span>
                                            </div>
                                        ) : (
                                            "Select player..."
                                        )}
                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Search players..."
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                {isLoadingPlayers ? (
                                                    <div className="flex items-center justify-center py-6">
                                                        <Loader2 className="h-6 w-6 animate-spin" />
                                                    </div>
                                                ) : (
                                                    "No players found."
                                                )}
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {players.map((player) => (
                                                    <CommandItem
                                                        key={player.id}
                                                        onSelect={() => {
                                                            setSelectedPlayer(player);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                playerId: player.id.toString()
                                                            }));
                                                            setOpen(false);
                                                        }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div>
                                                            <div className="font-medium">{player.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {player.team || 'No Team'} • {player.position}
                                                            </div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="content" className="text-sm font-medium">
                                Content
                            </label>
                            <MentionsInput
                                value={formData.content}
                                onChange={handleMentionChange}
                                style={defaultStyle}
                                className="mentions-input"
                                placeholder="Write your nugget..."
                            >
                                <Mention
                                    trigger="@"
                                    data={fetchPlayersForMention}
                                    displayTransform={(id, display) => `@${display}`}
                                    appendSpaceOnAdd={true}
                                    className="mention-link"
                                />
                            </MentionsInput>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="fantasyInsight" className="text-sm font-medium">
                                Fantasy Insight
                            </label>
                            <div className="prose prose-sm max-w-none">
                                <CKEditor
                                    editor={ClassicEditor as any}
                                    data={formData.fantasyInsight}
                                    onChange={(event, editor) => {
                                        const data = editor.getData();
                                        setFormData(prev => ({ ...prev, fantasyInsight: data }));
                                    }}
                                    config={editorConfig as any}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                        <div className="space-y-2 col-span-3">
                            <label htmlFor="sourceName" className="text-sm font-medium">
                                Source Name
                            </label>
                            <Input
                                id="sourceName"
                                name="sourceName"
                                value={formData.sourceName}
                                onChange={handleInputChange}
                                placeholder="Enter source name..."
                            />
                        </div>
                            <div className="space-y-2 col-span-3">
                            <label htmlFor="sourceUrl" className="text-sm font-medium">
                                Source URL
                            </label>
                            <Input
                                id="sourceUrl"
                                name="sourceUrl"
                                value={formData.sourceUrl}
                                onChange={handleInputChange}
                                placeholder="Enter source URL..."
                            />
                        </div>
                        <div className="space-y-2 col-span-1">
                            <label htmlFor="urlIcon" className="text-sm font-medium">
                                URL Icon
                            </label>
						<div className="space-y-2 w-36">
							<Select value={formData.urlIcon} onValueChange={(v) => setFormData((prev) => ({ ...prev, urlIcon: v }))}>
								<SelectTrigger>
									<SelectValue placeholder="Select Icon" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="link">
										<span className="flex items-center gap-2">
											<img src="/link.ico" className="h-6 w-6" />
                                            <span>Web Link</span>
										</span>
									</SelectItem>
									<SelectItem value="twitter">
										<span className="flex items-center gap-2">
											<img src="/twitter.jpg"  className="h-6 w-6" />
                                            <span>Twitter</span>
										</span>
									</SelectItem>
                                    <SelectItem value="youtube">
										<span className="flex items-center gap-2">
											<img src="/youtube1.svg"  className="h-6 w-6" />
                                            <span>Youtube</span>
										</span>
									</SelectItem>
                                
								</SelectContent>
							</Select>
						</div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/admin/nuggets")}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-primary to-[#595959] hover:from-primary hover:to-[#595959] hover:opacity-90 text-white"
                        >
                            {isSubmitting ? "Creating..." : "Create Nugget"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNugget; 