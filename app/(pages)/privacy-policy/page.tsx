import Link from "next/link";



const privacyPolicy = [
    {
        title: "Privacy Policy",
        subtitle: "Last updated: 2025-06-02",
        content: "32BeatWriters operates www,32beatwriers.com (the “Site”). This page informs you of our policies regarding the collection, use, and disclosure of Personal Information we receive from users of the Site. We use your Personal Information only for providing and improving the Site. By using the Site, you agree to the collection and use of information in accordance with this policy."
    },
    {
        title: "Information Collection and Use",
        content: "While using our Site, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to, your name, email address, postal address, and phone number (“Personal Information”)."
    },
    {
        title: "Log Data",
        content: "Like many site operators, we collect information that your browser sends whenever you visit our Site (“Log Data”). This Log Data may include information such as your computer's Internet Protocol (“IP”) address, browser type, browser version, the pages of our Site that you visit, the time and date of your visit, the time spent on those pages and other statistics."
    },
    {
        title: "Cookies",
        content: "Cookies are files with a small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your computer’s hard drive. Like many sites, we use “cookies” to collect information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Site."
    },
    {
        title: "Security",
        content: "The security of your Personal Information is important to us, but remember that no method of transmission over the internet is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security."
    },
    {
        title: "Changes to This Privacy Policy",
        content: "This Privacy Policy is effective as of 2025-06-02 and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page."
    },
    {
        title: "Contact Us",
        content: <Link href='/contact-us'>If you have any questions about this Privacy Policy, contact us <span className="text-red-800">here.</span></Link>
    }
]




export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto max-w-7xl flex flex-col items-start justify-center mt-6 mb-28">
            <h1 className="text-4xl font-bold">Privacy <span className="text-red-800">Policy</span></h1>

            <div className="flex flex-col items-start justify-center mt-10 mb-2">
                {privacyPolicy.map((item) => (
                   
                   <div key={item.title} className="flex flex-col items-start justify-center mt-4 mb-2">
                        <h2 className="text-2xl font-bold">{item.title}</h2>
                        <p className="text-gray-500 mt-2">{item.subtitle}</p>
                        <p className="text-gray-500 mt-2">{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
