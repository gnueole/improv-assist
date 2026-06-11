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
    ? "Houba Houba ! [DEV] • Moteur d'improvisation" 
    : "Houba Houba ! • Moteur d'improvisation";
  return {
    title,
    description: "Compagnon de scène ultime pour les comédiens d'improvisation théâtrale.",
    manifest: "/manifest.json",
    icons: {
      icon: "/favicon.svg",
      apple: "/icon.svg",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title,
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
  const googleTagId = rawTagId.trim().replace(/^['"]|['"]$/g, "");
  const isGTM = googleTagId.startsWith("GTM-");
  const hasValidTag = googleTagId.length > 0;

  return (
    <html lang="fr" className={`${outfit.variable} h-full select-none`}>
      <body className="bg-black text-zinc-100 antialiased h-full overflow-hidden">
        {hasValidTag && (
          isGTM ? (
            <>
              {/* Google Tag Manager */}
              <Script id="gtm-script" strategy="afterInteractive">
                {`
                  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${googleTagId}');
                  }
                `}
              </Script>
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
              <Script id="google-analytics" strategy="afterInteractive">
                {`
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
                `}
              </Script>
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
