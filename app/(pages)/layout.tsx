import type { Metadata, Viewport } from "next";
import { Cabin, Oswald, PT_Sans } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeProvider } from "../components/ThemeProvider";
import { ReduxProvider } from "../../lib/providers/ReduxProvider";
import { QueryProvider } from "../../lib/providers/QueryProvider";
import { ToastProvider } from "../components/Toast";
import IOSScrollFix from "../components/IOSScrollFix";
import ErrorBoundary from "../../components/ErrorBoundary";
import GoogleAnalytics from "../../lib/analytics/GoogleAnalytics";
import DeliveredToComponent from "../components/DeliveredToComponent";
import ScrollToTopButton from "../components/ScrollToTopButton";
// import Head from "next/head"; // No longer needed for Open Graph with Metadata export

// const cabin = Cabin({
//   variable: "--font-cabin",
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
// });

// const oswald = Oswald({
//   variable: "--font-oswald",
//   subsets: ["latin"],
//   weight: ["200", "300", "400", "500", "600", "700"],
// });

const product_sans = PT_Sans({
  variable: "--font-product-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
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
  metadataBase: new URL("https://32-beatwriters-web.vercel.app/"), // Set the base URL for production
  // viewport: {
  //   width: 'device-width',
  //   initialScale: 1,
  //   maximumScale: 1,
  //   userScalable: false,
  //   viewportFit: 'cover',
  // },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WB47DPBVKG"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-WB47DPBVKG');
            `,
          }}
        />
      </head>
      <body
        className={`${product_sans.variable} antialiased bg-white text-black dark:bg-[#18122B] dark:text-white`}
      >
        <ErrorBoundary>
          <ReduxProvider>
            <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <ToastProvider>
                  <GoogleAnalytics />
                  <IOSScrollFix />
                  <Header />
                  {children}
                  <DeliveredToComponent />
                  <Footer />
                  <ScrollToTopButton /> 
                </ToastProvider>
              </ThemeProvider>
            </QueryProvider>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}