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
  title: "Tuneboxd | Reseñas de álbumes, listas y comunidad musical",
  description: "Explorá reseñas de álbumes, descubrí música nueva y compartí tus playlists favoritas con la comunidad musical en Tuneboxd.",
  keywords: "reseñas de música, descubrir álbumes, playlists recomendadas, comunidad musical, red social de música, críticas de discos",
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
