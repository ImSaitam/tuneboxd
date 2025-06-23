import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationProvider } from "@/hooks/useNotifications";
import { UserNotificationProvider } from "@/hooks/useUserNotifications";
import { ThemeProvider } from "@/hooks/useTheme";
import { ModalContextProvider } from "@/components/ModalContext";
import Navbar from "@/components/Navbar";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Tuneboxd | Reseñas de música, álbumes y comunidad musical",
  description: "Tuneboxd es la mejor página de reseña de música. Descubre críticas de discos, comparte tus opiniones sobre álbumes y encuentra nueva música junto a una comunidad apasionada.",
  keywords: "reseñas de música, reseña de discos, reseña de álbumes, críticas musicales, comunidad musical, página de reseña de música, descubrir álbumes",
  robots: "index, follow",
  author: "Tuneboxd",
  category: "music, social media",
  other: {
    "format-detection": "telephone=no",
    "og:title": "Tuneboxd | Reseñas de música y comunidad",
    "og:description": "Descubre y comparte reseñas de discos y álbume. Únete a la comunidad musical de Tuneboxd.",
    "og:image": "https://tuneboxd.xyz/og-image.jpg",
    "og:url": "https://tuneboxd.xyz",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="overflow-x-hidden">      <body
        className={`${nunito.variable} ${nunitoSans.variable} font-sans antialiased overflow-x-hidden`}
      >
        <ThemeProvider>
          <ModalContextProvider>
            <AuthProvider>
              <NotificationProvider>
                <UserNotificationProvider>
                  <Navbar />
                  <main className="pt-20 overflow-x-hidden">
                    {children}
                  </main>
                </UserNotificationProvider>
              </NotificationProvider>
            </AuthProvider>
          </ModalContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
