import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationProvider } from "@/hooks/useNotifications";
import { UserNotificationProvider } from "@/hooks/useUserNotifications";
import { ThemeProvider } from "@/hooks/useTheme";
import { ModalContextProvider } from "@/components/ModalContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tuneboxd - Tu plataforma de reseñas musicales",
  description: "Descubre, reseña y comparte tu música favorita con la comunidad",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
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
