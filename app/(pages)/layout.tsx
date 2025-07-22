import type { Metadata } from "next";
import { Cabin, Oswald } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeProvider } from "../components/ThemeProvider";
import { ReduxProvider } from "../../lib/providers/ReduxProvider";
// import Head from "next/head"; // No longer needed for Open Graph with Metadata export

const cabin = Cabin({
  variable: "--font-cabin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "32BeatWriters",
  description: "Your Home For all NFL, Prospect and Fantasy Football News.",
  openGraph: {
    title: "32BeatWriters",
    description: "Your Home For all NFL, Prospect and Fantasy Football News.",
    // Correctly reference the image, ensuring it's in your `public` directory.
    // For production, you'll want to use an absolute URL here for better compatibility across platforms.
    images: "/logo-small.webp",
    // It's good practice to specify the type, especially for images.
    type: "website",
    // You should set the actual URL for your production site.
    // This helps Open Graph parsers correctly link back to your site.
    url: "https://32-beatwriters-web.vercel.app/", // **IMPORTANT: Update this to your actual production URL**
  },
  // If you uncommented `metadataBase`, ensure it points to your actual deployment URL in production.
  metadataBase: new URL("https://32-beatwriters-web.vercel.app/"), // Set the base URL for production
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* The viewport meta tag can remain here or be configured in the metadata export as well.
          For general page settings, the metadata export is often cleaner.
          If you have dynamic viewport needs per page, consider a client-side solution or dynamic metadata.
      */}
      {/* <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head> */}
      <body
        className={`${cabin.variable} ${oswald.variable} antialiased bg-white text-black dark:bg-[#18122B] dark:text-white`}
      >
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}