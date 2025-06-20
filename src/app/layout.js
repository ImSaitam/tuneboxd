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
  title: "Tuneboxd - Tu plataforma de reseñas musicales",
  description: "Descubre, reseña y comparte tu música favorita con la comunidad",
  keywords: "música, reseñas, álbumes, playlist, comunidad musical, social music",
  robots: "index, follow",
  author: "Tuneboxd",
  category: "music, social media",  other: {
    "format-detection": "telephone=no",
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
