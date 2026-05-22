"use server"
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function trackUserPrintActivity(actionType: 'PDF' | 'IMAGE' | 'PRINT') {
  const session = await auth();
  if (!session || !session.user?.id) return [];

  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const userId = session.user.id;

  const existingStat = await prisma.userStatistic.findUnique({
    where: {
      userId_date: {
        userId: userId,
        date: todayDate,
      },
    },
  });

  if (existingStat) {
    const updateData: any = {};
    if (actionType === 'PDF') updateData.pdfCount = { increment: 1 };
    if (actionType === 'IMAGE') updateData.imageCount = { increment: 1 };
    if (actionType === 'PRINT') updateData.directPrintCount = { increment: 1 };

    return await prisma.userStatistic.update({
      where: {
        userId_date: {
          userId: userId,
          date: todayDate,
        },
      },
      data: updateData,
    });
  } 

  else {
    return await prisma.userStatistic.create({
      data: {
        userId: userId,
        date: todayDate,
        pdfCount: actionType === 'PDF' ? 1 : 0,
        imageCount: actionType === 'IMAGE' ? 1 : 0,
        directPrintCount: actionType === 'PRINT' ? 1 : 0,
      },
    });
  }
}