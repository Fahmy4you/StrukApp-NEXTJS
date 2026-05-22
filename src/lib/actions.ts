'use server';
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export const handleLogout = async () => {
  const session = await auth();
  if (!session) return; 

  await signOut();
};

export async function getUserDashboardStats({ 
  filter = 'semua' 
}: { 
  filter?: 'hari' | 'minggu' | 'bulan' | 'tahun' | 'semua' 
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const now = new Date();
  let startDate: Date | undefined;

  // Penentuan range waktu berdasarkan filter
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

  // 1. Ambil data statistik cetak global/user
  const statsSummary = await prisma.userStatistic.aggregate({
    where: {
      ...(userId && { userId: userId }), // Jika guest, userId diabaikan (ambil data semua orang)
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

  // 2. Inisialisasi nilai awal untuk Layout dan User
  let totalLayoutCount = 0;
  let totalUserCount = 0;

  // 3. Logika Kondisional berdasarkan status login
  if (userId) {
    // JIKA USER LOGIN
    totalLayoutCount = await prisma.layout.count({
      where: {
        userId: userId,
        ...(startDate && {
          createdAt: { gte: startDate },
        }),
      },
    });
    totalUserCount = 0; // Sebaliknya, nilai totalUser diset 0
  } else {
    // JIKA GUEST (BELUM LOGIN)
    totalLayoutCount = 0; // Nilai totalLayout diset 0
    totalUserCount = await prisma.user.count({
      where: {
        ...(startDate && {
          createdAt: { gte: startDate },
        }),
      },
    });
  }
  
  return {
    totalLayout: totalLayoutCount,                     
    totalUser: totalUserCount, 
    totalPdf: statsSummary._sum.pdfCount || 0,                 
    totalGambar: statsSummary._sum.imageCount || 0,            
    totalPrint: statsSummary._sum.directPrintCount || 0,       
  };
}