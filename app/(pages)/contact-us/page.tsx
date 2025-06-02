import { Mail, Phone } from "lucide-react";



export default function ContactUs() {
    return (
        <div className="container mx-auto flex items-center justify-around mt-28 mb-42">

            <div className="flex flex-col gap-4 w-1/3 h-[600px] justify-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-bold">Contact Us</h1>
                    <h2 className="text-4xl font-bold">Get In Touch With Us</h2>
                </div>
                <div className="mt-4">
                    <p className="text-gray-500 text-lg">If you want to partner with us, have a question for us, or need help with your subscription, please contact us using one of the methods below.</p>
                </div>
                <div className="flex flex-col gap-4 mt-4">
                    <div className="flex items-center gap-4">
                        <Mail className="w-10 h-10" strokeWidth={1.5} />
                        <div className="flex flex-col">
                            <p className="text-gray-700 text-lg">Email Address</p>
                            <p className="text-gray-500 text-lg">info@32beatwriters.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Phone className="w-10 h-10" strokeWidth={1.5} />
                        <div className="flex flex-col">
                            <p className="text-gray-700 text-lg">Phone Number</p>
                            <p className="text-gray-500 text-lg">+1 (234) 567-890</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 items-start w-2/5 h-[600px] border border-gray-300 rounded-lg p-12 bg-gray-100">
                <input type="text" placeholder="Name" className="w-full h-1/6 p-2 rounded-lg border border-gray-300 bg-white" />
                <input type="text" placeholder="Email" className="w-full h-1/6 p-2 rounded-lg border border-gray-300 bg-white" />
                <select name="General Question" id="general-question" className="w-full h-1/6 p-2 rounded-lg border border-gray-300 bg-white">
                    <option value="partner">Partner</option>
                    <option value="question">Question</option>
                    <option value="other">Other</option>
                </select>
                <textarea placeholder="Your Message" rows={10} className="w-full p-2 rounded-lg border border-gray-300 bg-white" />
                <button className="bg-red-800 w-full h-1/6 text-white p-2 rounded-lg hover:cursor-pointer hover:scale-101 transition-all duration-100">Send</button>
            </div>
        </div>
    );
}
