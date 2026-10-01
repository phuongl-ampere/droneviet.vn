import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { LocalizedChrome } from "@/components/localized-chrome";
import { CustomerSessionProvider } from "@/components/customer/customer-session-provider";
import { CartProvider } from "@/components/store/cart-provider";
import { getSiteContent } from "@/lib/content";
import { getTranslations } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const copy = getTranslations("vi");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: copy.seo.defaultTitle,
    template: copy.seo.titleTemplate,
  },
  description: copy.seo.defaultDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = {
    vi: getSiteContent("vi"),
    en: getSiteContent("en"),
  };

  return (
    <html
      lang="vi"
      className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <CustomerSessionProvider>
            <LocalizedChrome content={content}>{children}</LocalizedChrome>
          </CustomerSessionProvider>
        </CartProvider>
      </body>
    </html>
  );
}
