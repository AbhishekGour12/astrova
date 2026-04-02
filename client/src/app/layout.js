
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


import {Providers} from './providers'
import {CartProvider} from './context/CartContext'
import ClientLayout from './ClientLayout'
import PathLayout from './PathLayout'
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'),
  title: {
    default: 'Talk to Expert Astrologer Online in India | Trusted Consultation | MyAstrova',
    template: '%s | MyAstrova'
  },
  description: 'Discover authentic sacred products for your spiritual journey',
  openGraph: {
    siteName: 'MyAstrova',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@MyAstrova',
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({ children }) {
  
  
  return (
    <html lang="en">
     
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
       {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RMNVENG1P5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RMNVENG1P5');
          `}
        </Script>
        {/* Facebook Pixel - Single Implementation */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
        >
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            // Initialize both pixels if you need both
            fbq('init', '2770032406663985');
            fbq('init', '1210462477541389');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* Noscript fallback for Facebook Pixel - Using next/script doesn't work well with noscript, use regular img tag */}
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2770032406663985&ev=PageView&noscript=1"
            alt=""
          />
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1210462477541389&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <PathLayout> 
        <Providers className="pt-[120px]">
          <CartProvider>
        
        <ClientLayout>{children}</ClientLayout> 
           

          </CartProvider>
        </Providers>
        </PathLayout>

       
       

       
      <Script
  id="razorpay-checkout-js"
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="afterInteractive" // Better for mobile performance
/>
         
        
      </body>
    </html>
  );
}
