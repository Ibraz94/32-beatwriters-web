"use client"

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, CheckCircle } from "lucide-react";
import { ContactRequest, useSubmitContactMutation } from "@/lib/services/contactApi";


export default function ContactUs() {
    const [submitContact, { isLoading }] = useSubmitContactMutation();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        
        try {
            await submitContact(data as unknown as ContactRequest);
            setIsSubmitted(true);
            // Reset form
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Error submitting contact form:', error);
        }
    }

    return (
        <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row lg:items-center lg:justify-around mt-8 lg:mt-28 mb-16 lg:mb-42 px-4 lg:px-0 gap-8 lg:gap-0">

            <div className="flex flex-col gap-3 w-full lg:w-1/2 lg:h-[600px] justify-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-lg lg:text-xl font-bold">Contact Us</h1>
                    <h2 className="text-2xl lg:text-4xl font-bold">Get In Touch With Us</h2>
                </div>
                <div className="mt-4">
                    <p className="text-base lg:text-lg">If you want to partner with us, have a question for us, or need help with your subscription, please contact us using one of the methods below.</p>
                </div>
                <div className="flex flex-col gap-4 mt-4">
                    <div className="flex items-center gap-4">
                        <Mail className="w-8 h-8 lg:w-10 lg:h-10" strokeWidth={1.5} />
                        <div className="flex flex-col">
                            <p className="text-base lg:text-lg">Email Address</p>
                            <p className="text-base lg:text-lg">info@32beatwriters.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Phone className="w-8 h-8 lg:w-10 lg:h-10" strokeWidth={1.5} />
                        <div className="flex flex-col">
                            <p className="text-base lg:text-lg">Phone Number</p>
                            <p className="text-base lg:text-lg">(818) 308-5020</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-2/5 lg:h-[600px]">
                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center h-full border-2 shadow-xl rounded-lg p-6 lg:p-12">
                        <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                        <p className="text-gray-400 text-center mb-4">
                            Your message has been submitted successfully. We'll get back to you soon!
                        </p>
                        <button 
                            onClick={() => setIsSubmitted(false)}
                            className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 transition-colors"
                        >
                            Send Another Message
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-start w-full h-full border-2 shadow-xl rounded-lg p-6 lg:p-12">
                        <input type="text" name="name" placeholder="Name" className="w-full h-12 p-2 rounded-lg border-2 shadow-sm" required />
                        <input type="email" name="email" placeholder="Email" className="w-full h-12 p-2 rounded-lg border-2 shadow-sm" required />
                        <p className="text-sm text-gray-500 -mb-3">Please choose what best reflects what you are contacting us about</p>
                        <Select name="subject" value="General Question">
                            <SelectTrigger className="w-full p-2 shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General Question" defaultValue="General Question">General Question</SelectItem>
                                <SelectItem value="Subscription" defaultValue="Subscription">Subscription</SelectItem>
                                <SelectItem value="Podcast" defaultValue="Podcast">Podcast</SelectItem>
                                <SelectItem value="Partner with us" defaultValue="Partner with us">Partner With Us</SelectItem>
                            </SelectContent>
                        </Select>
                        <textarea name="message" placeholder="Your Message" rows={6} className="w-full p-2 rounded-lg border-2 shadow-sm lg:flex-1" required />
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="bg-red-800 w-full h-12 text-white p-2 rounded-lg hover:cursor-pointer hover:scale-101 transition-all duration-100 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
