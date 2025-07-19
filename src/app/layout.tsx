import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers/providers";
import { vazirmatn } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "اورا تسک | مدیریت وظایف شخصی",
  description: "اپلیکیشن مدیریت وظایف شخصی با قابلیت‌های هوش مصنوعی",
  keywords: ["task management", "todo list", "productivity", "persian", "RTL"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazirmatn.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
