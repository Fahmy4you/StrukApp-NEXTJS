import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth"; // Import auth dari konfigurasi NextAuth kamu
import { CONFIG_UPLOAD_IMAGES } from "@/lib/config";

export async function POST(request: Request) {
  try {
    // 1. PROTEKSI: Cek apakah user sudah login
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Silahkan login terlebih dahulu" }, 
        { status: 401 }
      );
    }

    // 2. Ambil data dari JSON (Base64)
    const { base64, category } = await request.json();

    // 3. Validasi: Apakah kategori terdaftar di config?
    if (!category || !CONFIG_UPLOAD_IMAGES[category as keyof typeof CONFIG_UPLOAD_IMAGES]) {
      return NextResponse.json({ error: "Kategori ilegal!" }, { status: 400 });
    }

    const targetConfig = CONFIG_UPLOAD_IMAGES[category as keyof typeof CONFIG_UPLOAD_IMAGES];

    // 4. Ekstrak info dari Base64
    const mimeType = base64.match(/data:(.*?);base64/)?.[1];
    const base64Data = base64.split(",")[1];
    
    if (!base64Data || !mimeType) {
      return NextResponse.json({ error: "Format Base64 tidak valid!" }, { status: 400 });
    }

    const buffer = Buffer.from(base64Data, "base64");

    // 5. Validasi Tipe File & Ukuran
    if (!targetConfig.allowedTypes.includes(mimeType)) {
      return NextResponse.json({ error: "Format file tidak diizinkan!" }, { status: 400 });
    }

    if (buffer.length > targetConfig.maxSize) {
      return NextResponse.json({ error: "File terlalu besar!" }, { status: 400 });
    }

    // 6. Tentukan Path & Simpan
    // Tips: Kita bisa tambahkan userId ke nama file agar lebih aman & terorganisir
    const userId = session.user.id;
    const relativePath = `/image/upload/${targetConfig.folder}`;
    const uploadDir = path.join(process.cwd(), "public", relativePath);

    await mkdir(uploadDir, { recursive: true });

    const extension = mimeType.split("/")[1];
    
    // Nama file: timestamp-userid.ext
    const finalFileName = `${Date.now()}-${userId}.${extension}`;
    const filePath = path.join(uploadDir, finalFileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      path: `${relativePath}/${finalFileName}`,
      message: "File berhasil disimpan"
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Gagal memproses unggahan" }, { status: 500 });
  }
}