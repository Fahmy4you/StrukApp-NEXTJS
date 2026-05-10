import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { ROLES } from "@/lib/constanta";

/**
 * Mendapatkan semua Settings (Hanya Admin)
 * Digunakan untuk melihat konfigurasi seluruh user di sistem.
 */
export const getAllSettings = async (filters?: {
  sortBy?: keyof Prisma.SettingsOrderByWithRelationInput;
  order?: "asc" | "desc";
}) => {
  const session = await auth();
  if (!session) redirect("/login");

  // 1. Proteksi: Hanya Admin yang boleh list semua settings
  const isAdmin = session.user.role === ROLES[0].value;
  if (!isAdmin) {
    throw new Error("Forbidden: Anda tidak memiliki akses untuk melihat semua pengaturan.");
  }

  try {
    const allSettings = await prisma.settings.findMany({
      orderBy: {
        [filters?.sortBy || "createdAt"]: filters?.order || "desc",
      },
      // Opsional: Sertakan info user agar admin tahu ini settings milik siapa
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    return allSettings;
  } catch (error) {
    console.error("Error fetching all settings:", error);
    return [];
  }
};

/**
 * Mendapatkan Settings
 * User hanya bisa mengambil miliknya sendiri. Admin bisa ambil milik siapa saja via userId.
 */
export const getSettingByUserId = async (targetUserId?: string) => {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === ROLES[0].value;
  // Jika bukan admin, paksa ambil ID diri sendiri
  const finalUserId = isAdmin && targetUserId ? targetUserId : session.user.id;

  try {
    const settings = await prisma.settings.findFirst({
      where: { userId: finalUserId },
    });
    
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
};

/**
 * Upsert Settings (Update or Create)
 * Karena tiap user biasanya cuma punya 1 konfigurasi settings (misal: tema, notifikasi)
 */
export const upsertSettings = async (data: {
  userId?: string;
  data: any; // Ini field 'data' di model yang bertipe Json
}) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = session.user.role === ROLES[0].value;
  const finalUserId = isAdmin && data.userId ? data.userId : session.user.id;

  try {
    // Cari dulu apakah sudah ada
    const existingSettings = await prisma.settings.findFirst({
      where: { userId: finalUserId }
    });

    if (existingSettings) {
      // Jika ada, update
      const updated = await prisma.settings.update({
        where: { id: existingSettings.id },
        data: { data: data.data },
      });
      return { success: true, action: "update", data: updated };
    } else {
      // Jika belum ada, create
      const created = await prisma.settings.create({
        data: {
          userId: finalUserId,
          data: data.data,
        },
      });
      return { success: true, action: "create", data: created };
    }
  } catch (error) {
    console.error("Error upserting settings:", error);
    return { success: false, error: "Gagal menyimpan pengaturan" };
  }
};

/**
 * Delete Settings
 * Hanya boleh menghapus milik sendiri (kecuali Admin)
 */
export const deleteSettings = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = session.user.role === ROLES[0].value;

  const existingSettings = await prisma.settings.findUnique({
    where: { id }
  });

  if (!existingSettings) throw new Error("Settings tidak ditemukan");

  // Proteksi kepemilikan
  if (!isAdmin && existingSettings.userId !== session.user.id) {
    throw new Error("Forbidden: Akses ditolak");
  }

  try {
    await prisma.settings.delete({
      where: { id },
    });
    return { success: true, message: "Pengaturan berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting settings:", error);
    return { success: false, error: "Gagal menghapus pengaturan" };
  }
};