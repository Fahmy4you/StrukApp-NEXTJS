'use server';
import { auth, signOut } from "@/auth";
import { ROLES } from "@/lib/constanta";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/file";

export const upsertSettingsAction = async (data: {
  userId?: string;
  data: any; 
}) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = session.user.role == ROLES[0].value || session.user.role == ROLES[0].id;
  const finalUserId = isAdmin && data.userId ? data.userId : session.user.id;

  // Variabel untuk menampung path file yang akan dihapus nanti
  let fileToDelete: string | null = null;

  try {
    const existingSettings = await prisma.settings.findFirst({
      where: { userId: finalUserId }
    });

    if (existingSettings) {
      const oldData = existingSettings.data as any;
      const newData = data.data;

      // 1. Tentukan apakah ada file yang perlu dihapus
      if (oldData?.logo && newData?.logo && oldData.logo !== newData.logo) {
        if (oldData.logo.startsWith("/image/upload/")) {
          // Kita simpan path-nya saja, JANGAN dihapus dulu
          fileToDelete = oldData.logo;
        }
      }

      // 2. Lakukan Update Database
      const updated = await prisma.settings.update({
        where: { id: existingSettings.id },
        data: { data: data.data },
      });

      // 3. JIKA database sukses, baru hapus file fisiknya
      if (fileToDelete) {
        // Kita tidak perlu pakai 'await' di sini jika tidak ingin menghambat respons ke user,
        // tapi sebaiknya tetap pakai agar kita tahu jika ada error di log.
        await deleteFile(fileToDelete);
      }

      return { success: true, data: updated };
    } else {
      // Logika create (tidak ada yang perlu dihapus karena data baru)
      const created = await prisma.settings.create({
        data: { userId: finalUserId, data: data.data },
      });
      return { success: true, data: created };
    }
  } catch (error) {
    // Jika blok try di atas (termasuk Prisma) gagal, 
    // kode di bawah 'fileToDelete' tidak akan pernah dieksekusi.
    // Jadi file lama aman di folder.
    console.error("Gagal simpan settings:", error);
    return { success: false, error: "Gagal menyimpan ke database" };
  }
};

export const handleLogout = async () => {
  await signOut();
};