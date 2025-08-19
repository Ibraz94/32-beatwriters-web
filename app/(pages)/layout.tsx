import type { Metadata } from "next";
import { Cabin, Oswald } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeProvider } from "../components/ThemeProvider";
import { ReduxProvider } from "../../lib/providers/ReduxProvider";
import { ToastProvider } from "../components/Toast";
import IOSScrollFix from "../components/IOSScrollFix";
import ErrorBoundary from "../../components/ErrorBoundary";
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
    images: "/logo-small.webp",
    type: "website",
    url: "https://32beatwriters.com/", // **IMPORTANT: Update this to your actual production URL**
  },
  metadataBase: new URL("https://32beatwriters.com/"), // Set the base URL for production
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body
        className={`${cabin.variable} ${oswald.variable} antialiased bg-white text-black dark:bg-[#18122B] dark:text-white`}
      >
        <ErrorBoundary>
          <ReduxProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ToastProvider>
                <IOSScrollFix />
                <Header />
                {children}
                <Footer />
              </ToastProvider>
            </ThemeProvider>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}