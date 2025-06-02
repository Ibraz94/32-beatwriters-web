import Link from "next/link";

const termsAndConditions = [
    {
        title: "Terms & Conditions",
        subtitle: "Last updated: 2025-06-02",
        content: "Please read these terms and conditions carefully before using www.32beatwriters.com (the “Site”) operated by 32BeatWriters (“us”, “we”, or “our”). Your access to and use of the Site is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Site. By accessing or using the Site, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Site."
    },
    {
        title: "Content",
        content: "Our Site allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material (“Content”). You are responsible for the Content that you post on or through the Site, including its legality, reliability, and appropriateness. By posting Content on or through the Site, you represent and warrant that: (a) the Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (b) that the posting of your Content on or through the Site does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person or entity."
    },
    {
        title: "Intellectual Property",
        content: "The Site and its original content, features, and functionality are owned by [Your Company Name] and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability."
    },
    {
        title: "Termination",
        content: "We may terminate or suspend access to our Site immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
    },
    {
        title: "Links To Other Web Sites",
        content: "Our Site may contain links to third-party websites or services that are not owned or controlled by 32BeatWriters. 32BeatWriters has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that 32BeatWriters shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services."
    },
    {
        title: "Changes to These Terms and Conditions",
        content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days’ notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Site after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Site."
    },
    {
        title: "Contact Us",
        content: <Link href='/terms-and-conditions'>If you have any questions about this Privacy Policy, contact us <span className="text-red-800">here.</span></Link>
    }
]



export default function TermsAndConditions() {
    return (
        <div className="container mx-auto max-w-7xl flex flex-col items-start justify-center mt-6 mb-28">
            <h1 className="text-4xl font-bold">Terms & <span className="text-red-800">Conditions</span></h1>

            <div className="flex flex-col items-start justify-center mt-10 mb-2">
                {termsAndConditions.map((item) => (
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
