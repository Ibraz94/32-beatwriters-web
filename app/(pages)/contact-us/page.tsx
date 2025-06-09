import { Mail, Phone } from "lucide-react";

export default function ContactUs() {
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
                            <p className="text-base lg:text-lg">+1 (234) 567-890</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 items-start w-full lg:w-2/5 lg:h-[600px] border-2 shadow-lg rounded-lg p-6 lg:p-12">
                <input type="text" placeholder="Name" className="w-full h-12 p-2 rounded-lg border" />
                <input type="text" placeholder="Email" className="w-full h-12 p-2 rounded-lg border" />
                <select name="General Question" id="general-question" className="w-full h-12 p-2 rounded-lg border">
                    <option value="other">Other</option>
                    <option value="partner">Partner</option>
                    <option value="question">Question</option>

                </select>
                <textarea placeholder="Your Message" rows={6} className="w-full p-2 rounded-lg border lg:flex-1" />
                <button className="bg-red-800 w-full h-12 text-white p-2 rounded-lg hover:cursor-pointer hover:scale-101 transition-all duration-100">Send Message</button>
            </div>
        </div>
    );
}
