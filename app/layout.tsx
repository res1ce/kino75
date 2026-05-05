import type { Metadata } from "next";
import "./globals.css";
import { AccessibilityProvider } from "@/lib/accessibility";
import MainLayout from "@/components/MainLayout";
import VisitTracker from "@/components/VisitTracker";

export const metadata: Metadata = {
  title: "Забайкальская государственная кинокомпания",
  description: "Официальный сайт Забайкальской государственной кинокомпании: кинотеатры, новости, услуги и информация о кинопроизводстве в Забайкальском крае.",
  keywords: ["кино", "Забайкалье", "кинотеатр", "фильмы", "Чита"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="light" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <AccessibilityProvider>
          <MainLayout>{children}</MainLayout>
          <VisitTracker />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
