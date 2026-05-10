import { error } from 'console';
import {z} from 'zod';

export const AIModelStrukSchema = z.object({
    tanggal: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Format tanggal harus DD/MM/YYYY"),
    waktu: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:mm"),
    bank_tujuan: z.string().min(1, "Bank tujuan harus diisi"),
    no_rekening: z.string().min(1, "No rekening harus diisi"),
    nama_penerima: z.string().min(1, "Nama penerima harus diisi"),
    nominal: z.number({ error: "Nominal harus berupa angka positif" }).positive(),
    status: z.enum(["berhasil", "gagal"], { error: "Status harus 'berhasil' atau 'gagal'" }),
});