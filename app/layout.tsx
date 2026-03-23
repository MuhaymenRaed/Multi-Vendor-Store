import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./_lib/theme-provider";
import { NavigationProgress } from "./_components/NavigationProgress";
import "./styles/globals.css";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  // Basic Info
  title: {
    default: "Sinaa Link",
    template: "%s | Sinaa Link", // For page-specific titles
  },
  description:
    "متجر متعدد البائعين يربط بين المشترين والبائعين في سوق صناعية حيوية، حيث يمكن للبائعين عرض منتجاتهم وخدماتهم، وللمشترين اكتشاف وشراء ما يحتاجونه بسهولة وأمان. يوفر منصة شاملة للتجارة الإلكترونية تجمع بين التنوع والسهولة في تجربة التسوق.",
  keywords: [
    "Sinaa Link",
    "لنك الصناعة",
    "صناعة لنك",
    "صناعة لينك",
    "لينك الصناعة",
    " الصناعة لينك",
    "لنك الصناعه",
    "الصناعه لنك",
    "multi-vendor marketplace",
    "شارع الصناعة",
    "متجر متعدد البائعين",
    "مكتب سجاد للحاسبات",
    "سجاد للحاسبات",
    "مهيمن رائد الأعمال",
    "sinah link",
    "sinaalink",
    "sinaa-link",
    // Add 8-12 relevant keywords
  ],
  authors: [{ name: "Sajad Naeem" }],
  creator: "Muhaymen Raed",
  publisher: "Muhaymen Raed",

  // Technical
  formatDetection: {
    email: true, //
    address: true, //en
    telephone: false,
  },

  // Robots
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

  // Icons
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
    other: {
      rel: "icon",
      url: "/favicon.svg",
    },
  },

  // PWA
  manifest: "/site.webmanifest",

  // Verification (add later)
  verification: {
    // google: "your-verification-code", // Add after Google Search Console setup
  },

  // Canonical URL
  alternates: {
    canonical: "https://www.sinaal.ink",
  },

  // Category
  category: "technology",

  // Open Graph (Social Sharing)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.sinaal.ink/",
    title: " Sinna Link |  multi-vendor marketplace",
    description:
      "متجر متعدد البائعين يربط بين المشترين والبائعين في سوق صناعية حيوية، حيث يمكن للبائعين عرض منتجاتهم وخدماتهم، وللمشترين اكتشاف وشراء ما يحتاجونه بسهولة وأمان. يوفر منصة شاملة للتجارة الإلكترونية تجمع بين التنوع والسهولة في تجربة التسوق.",
    siteName: "Sinaa Link",
    images: [
      {
        url: "https://www.sinaal.ink/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sinaa Link - multi-vendor marketplace",
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Sinaa Link | multi-vendor marketplace",
    description:
      "متجر متعدد البائعين يربط بين المشترين والبائعين في سوق صناعية حيوية، حيث يمكن للبائعين عرض منتجاتهم وخدماتهم، وللمشترين اكتشاف وشراء ما يحتاجونه بسهولة وأمان. يوفر منصة شاملة للتجارة الإلكترونية تجمع بين التنوع والسهولة في تجربة التسوق.",
    images: ["https://www.sinaal.ink/og-image.png"],
    creator: "@__muhaymen__", // Optional
  },

  // Other
  other: {
    "msapplication-TileColor": "#00bcd4", // For Windows tiles
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00bcd4" },
    { media: "(prefers-color-scheme: dark)", color: "#f8fafc" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Muhaymen Raed",
    jobTitle: "Programmer",
    url: "https://www.sinaal.ink/",
    image: "https://www.sinaal.ink/og-image.png",
    sameAs: [
      "https://github.com/MuhaymenRaed",
      "https://linkedin.com/in/muhaymenraed",

      // Add all your social profiles
    ],
    knowsAbout: [
      "React",
      "TypeScript",
      "Next.js",
      "superbase",
      "tailwindcss",
      "lucide-react",
      "motion",
      "web development",
      "software engineering",
    ],
    description:
      "Muhaymen Raed is a skilled programmer with expertise in React, TypeScript, Next.js, superbase, tailwindcss, lucide-react, and motion. With a passion for web development and software engineering, Mohyaman has a proven track record of delivering high-quality projects and innovative solutions.",
    alumniOf: {
      "@type": "Personal_Organization",
      name: "University of Baghdad",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Iraq",
      addressRegion: "Baghdad",
      addressCountry: "IQ", // e.g., "US", "IQ"
    },
  };

  // JSON-LD Structured Data - WebSite Schema
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sinaa Link",
    url: "https://www.sinaal.ink/",
    description:
      "متجر متعدد البائعين يربط بين المشترين والبائعين في سوق صناعية حيوية، حيث يمكن للبائعين عرض منتجاتهم وخدماتهم، وللمشترين اكتشاف وشراء ما يحتاجونه بسهولة وأمان. يوفر منصة شاملة للتجارة الإلكترونية تجمع بين التنوع والسهولة في تجربة التسوق.",
    author: {
      "@type": "Person",
      name: "Muhaymen Raed",
    },
    inLanguage: "ar",
  };

  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        {/* JSON-LD Person Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {/* JSON-LD WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>

      <body>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--marketplace-card-bg)",
              color: "var(--marketplace-text-primary)",
              border: "2px solid var(--border)",
              fontSize: "14px",
              borderRadius: "var(--radius)",
              padding: "12px 20px",
              boxShadow: "none",
            },
            success: {
              style: {
                borderColor: "var(--marketplace-accent)",
              },
            },
            error: {
              style: {
                borderColor: "var(--danger)",
              },
            },
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationProgress />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
