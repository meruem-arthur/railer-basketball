import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UMaT SRID Railers | Basketball",
    template: "%s | UMaT SRID Railers",
  },
  description: "Official home of the UMaT SRID Railers basketball team.",
  openGraph: {
    title: "UMaT SRID Railers | Basketball",
    description: "Official home of the UMaT SRID Railers basketball team.",
    siteName: "UMaT SRID Railers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UMaT SRID Railers | Basketball",
    description: "Official home of the UMaT SRID Railers basketball team.",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-rail-bg text-rail-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded focus:bg-rail-gold focus:px-4 focus:py-2 focus:text-rail-bg focus:font-semibold"
        >
          Skip to content
        </a>
        <div id="main-content" className="flex-1 flex flex-col">
          {children}
        </div>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#081321",
              border: "1px solid rgba(174,182,193,0.2)",
              color: "#F5F5F5",
            },
          }}
        />
      </body>
    </html>
  );
}
