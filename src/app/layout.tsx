/**
 * @file layout.tsx
 * @description Root HTML layout wrapper for Next.js. Configures the metadata, viewport, fonts, and Google Analytics script injection.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ImprovBufferProvider } from "@/context/ImprovBufferContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const isDev = process.env.NODE_ENV === "development";
  const title = isDev 
    ? "Houba Houba! [DEV] • Moteur d'improvisation" 
    : "Houba Houba! • Moteur d'improvisation";
  const description = "Le compagnon de scène ultime pour les comédiens de théâtre d'improvisation. Générez instantanément des idées de thèmes, émotions, époques, personnages, lieux, échauffements et contraintes.";
  
  return {
    title,
    description,
    manifest: "/manifest.json",
    keywords: [
      "improvisation", 
      "théâtre d'impro", 
      "générateur d'improvisation", 
      "moteur d'impro", 
      "exercices d'impro", 
      "idées de scènes", 
      "outils de théâtre", 
      "échauffements improvisation", 
      "scénarios impro"
    ],
    icons: {
      icon: "/favicon.svg",
      apple: "/icon.svg",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title,
    },
    openGraph: {
      title,
      description,
      url: "https://eole.me/improv-assist",
      siteName: "Houba Houba!",
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rawTagId = process.env.GOOGLE_TAG_ID || process.env.NEXT_PUBLIC_GA_ID || "";
  // Strip outer quotes, escaped quotes, backslashes, and literal quote marks
  const googleTagId = rawTagId
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\/g, "")
    .replace(/"/g, "")
    .replace(/'/g, "");
  const isGTM = googleTagId.startsWith("GTM-");
  const hasValidTag = googleTagId.length > 0 && googleTagId !== "undefined" && googleTagId !== "null";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Houba Houba!",
    "operatingSystem": "All",
    "applicationCategory": "EntertainmentApplication",
    "description": "Le compagnon de scène ultime pour les comédiens de théâtre d'improvisation.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    }
  };

  return (
    <html lang="fr" className={`${outfit.variable} h-full select-none`} suppressHydrationWarning>
      <body className="bg-black text-zinc-100 antialiased h-full overflow-hidden" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {hasValidTag && (
          isGTM ? (
            <>
              {/* Google Tag Manager */}
              <Script
                id="gtm-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                      })(window,document,'script','dataLayer','${googleTagId}');
                    }
                  `
                }}
              />
              {/* Google Tag Manager (noscript) */}
              <noscript>
                <iframe
                  src={`https://www.googletagmanager.com/ns.html?id=${googleTagId}`}
                  height="0"
                  width="0"
                  style={{ display: "none", visibility: "hidden" }}
                />
              </noscript>
            </>
          ) : (
            <>
              {/* Google Analytics (gtag.js) */}
              <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                      var sc = document.createElement('script');
                      sc.src = 'https://www.googletagmanager.com/gtag/js?id=${googleTagId}';
                      sc.async = true;
                      document.head.appendChild(sc);

                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${googleTagId}');
                    }
                  `
                }}
              />
            </>
          )
        )}
        <ImprovBufferProvider>
          {children}
        </ImprovBufferProvider>
      </body>
    </html>
  );
}
