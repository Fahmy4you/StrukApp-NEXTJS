'use server';
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const handleLogout = async () => {
  await signOut();
};

export async function getUserDashboardStats({ filter = 'semua' }: {filter?: 'hari' | 'minggu' | 'bulan' | 'tahun' | 'semua'}) {
  const session = await auth();
  if (!session) redirect("/login");

  const now = new Date();
  let startDate: Date | undefined;
  let userId = session.user.id;

  if (filter === 'hari') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (filter === 'minggu') {
    startDate = new Date();
    startDate.setDate(now.getDate() - 7);
  } else if (filter === 'bulan') {
    startDate = new Date();
    startDate.setDate(now.getDate() - 30);
  } else if (filter === 'tahun') {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  const statsSummary = await prisma.userStatistic.aggregate({
    where: {
      userId: userId,
      ...(startDate && {
        date: { gte: startDate },
      }),
    },
    _sum: {
      pdfCount: true,
      imageCount: true,
      directPrintCount: true,
    },
  });

  const totalLayoutCount = await prisma.layout.count({
    where: {
      userId: userId,
      ...(startDate && {
        createdAt: { gte: startDate },
      }),
    },
  });

  return {
    totalLayout: totalLayoutCount,                             
    totalPdf: statsSummary._sum.pdfCount || 0,                 
    totalGambar: statsSummary._sum.imageCount || 0,             
    totalPrint: statsSummary._sum.directPrintCount || 0,       
  };
}