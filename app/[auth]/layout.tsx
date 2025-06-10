import type { Metadata } from "next";
import { Cabin } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { ReduxProvider } from "../../lib/providers/ReduxProvider";  


const cabin = Cabin({
  variable: "--font-cabin",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "32 Beat Writers",
  description: "32 Beat Writers is a platform for beat writers to create and share their beats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cabin.variable} antialiased`}
        suppressHydrationWarning
      >
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
