


const faqs = [
    {
        question: "I Signed Up Using the 32BW Site",
        answer: "You can log in and then you’ll have access immediately to the Premium section and Premium articles.."
    },
    {
        question: "I Signed Up Using Underdog",
        answer: "We will need 24-48 hours to verify your sign up with Underdog and create your account. You will get an email with log in info."
    },
    {
        question: "I Signed Up Using Patreon",
        answer: "We will do our best to message you and get your info to create a site login. All Premium articles and summaries will still be available on Patreon. However, news sorted by team and player will only be available on our website due to restrictions on content with Patreon."
    },
    {
        question: "How Do I Use the Site?",
        answer: "All team and player summaries will be under the Premium link. All daily summaries will be in the Articles section.3"
    },
    {
        question: "You’ll Always Have a 100 & Ad-Free Experience",
        answer: "Part of your membership payment goes toward keeping the website ad free and easy to navigate."
    },
];


export default function faq() {
        return (
    <div className="container mx-auto max-w-7xl flex flex-col items-start justify-center mt-6 mb-28">
        <h1 className="text-4xl font-bold">Subscriber <span className="text-red-800">FAQ's</span></h1>
        <p className="text-lg text-gray-500 mt-4">So you just signed up for 32BeatWriters, now what?</p>

        <div className="flex flex-col items-start justify-center mt-8 mb-2">
            {faqs.map((faq) => (
                <div key={faq.question} className="flex flex-col items-start justify-center mt-6 mb-8">
                    <h2 className="text-xl font-bold">{faq.question}</h2>
                    <p className="text-gray-500 mt-2">{faq.answer}</p>
                </div>
            ))}
        </div>
    </div>
    )
}
