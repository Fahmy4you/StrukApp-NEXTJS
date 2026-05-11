import type { Metadata } from "next";
import "@/styles/globals.css";
import { poppinsFont } from "@/lib/fonts";
import DarkModeToggle from "@/components/button/DarkModeToggle";
import DashboardLayoutClient from '@/components/layouts/DashboardLayoutClient';
import { SessionProvider } from "next-auth/react";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dashboard | Struk Digital - Buat Struk Digital dengan Mudah",
  description: "Aplikasi Pembuatan Struk Digital",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
  });

  if(!user) {
    await signOut();
  }

  return (
    <html
      lang="en"
      className={`${poppinsFont.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <DashboardLayoutClient>
            {children}
          </DashboardLayoutClient>
        </SessionProvider>
        <DarkModeToggle/>
      </body>
    </html>
  );
}
