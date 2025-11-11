import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { owners, ownersWide } from "./fonts";
import "./styles/globals.scss";
import Providers from "./providers";

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Juice Finder",
  description: "Trouvez facilement des restaurants, bars et cafés en France",
  keywords: "restaurant, bar, café, France, OpenStreetMap, recherche, carte, Juice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${lexend.className} ${owners.variable} ${ownersWide.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
