'use client';
import { useState, ChangeEvent, useEffect } from 'react';
import { 
  Upload,
  Loader2,
  FileText
} from 'lucide-react';
import PreviewModal from '@/components/modal/PreviewModal';
import { Checkbox } from '@/components/inputs/CheckBox';
import { NOT_TASK_AI_TYPE_INPUT } from '@/lib/constanta';
import { InputTextConfig } from '@/types/MainStruk';
import { SettingsData } from '@/types/Settings';
import { ReceiptElement } from '@/components/pages/PageStrukManualClient';
import { getReceiptMetadata, normalizeKey } from '@/lib/Helpers';
import { createReceipt } from '@/models/Receipt';
import { AlertLine } from '@/components/alerts/AlertLine';

interface Previews {
  struk_image: string | null;
}

interface FormDataUpload {
  struk_image: string | null;
}

const PageUploadStrukClient = ({settings, config, configId}: {settings : SettingsData | null, config: ReceiptElement[], configId: string | null}) => {
    const initialData = config
        .filter((el): el is InputTextConfig => el.type === 'input_text')
        .reduce((acc, el) => {
          acc[normalizeKey(el.label)] = '';
          return acc;
        }, {} as Record<string, any>);


    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [previews, setPreviews] = useState<Previews>({
        struk_image: null,
    });
    const [formData, setFormData] = useState<FormDataUpload>({
        struk_image: null,
    });
    const [strukData, setStrukData] = useState<Record<string, any>>({
        ...initialData,
        showAdmin: true
    });
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);


    const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const name = e.target.name;
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviews(prev => ({ ...prev, [name]: result }));
                setFormData(prev => ({ ...prev, [name]: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (): Promise<void> => {
        if (!formData.struk_image) {
            setAlert({
                type: 'error',
                message: "Silakan unggah gambar struk terlebih dahulu."
            });
            return;
        }

        setIsGenerating(true);
        try {
            // 1. Filter config untuk mendapatkan daftar field yang butuh diekstraksi AI
            // Kita hanya meminta field yang BUKAN merupakan tipe sistem/otomatis
            const fieldsToExtract = config
                .filter(el => el.type === 'input_text' && !NOT_TASK_AI_TYPE_INPUT.includes(el.dataType || ''))
                .map(el => ({
                    label: el.label,
                    key: normalizeKey(el.label),
                    dataType: el.dataType
                }));

            // const res = await fetch("/api/image_to_raw_struk", {
            //     method: "POST",
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         imageBase64: formData.struk_image.split(",")[1],
            //         mimeType: formData.struk_image.split(";")[0].split(":")[1],
            //         // Kirim daftar field yang dinamis ke AI agar AI tahu apa yang harus dicari
            //         targetFields: fieldsToExtract, 
            //     }),
            // });

            // if (!res.ok) {
            //     setAlert({
            //         'type': 'error',
            //         'message': 'Terjadi kesahalan saat OCR, Coba lagi'
            //     });

            //     return
            // }

            // const aiResponse = await res.json();
            const aiResponse = {
                "success": true,
                "extractedData": {
                    "kode_referensi": null,
                    "tanggal": "29/04/2026",
                    "waktu": "16:03:52",
                    "nama": "SITI ROISYAH",
                    "bank": "BCA",
                    "rekening": "2001090218",
                    "nominal": "4347925",
                    "status": "BERHASIL"
                },
                "modelUsed": "gemini-3-flash-preview"
            };
            console.log(aiResponse);

            // 2. Petakan hasil AI ke dalam strukData
            // Pastikan backend mengembalikan object dengan key yang sesuai dengan normalisasi kita
            setStrukData((prev) => ({
                ...prev,
                ...aiResponse.extractedData,
            }));

            // 1. Logika Pengambilan Nama yang Disiplin (Hirarki Ketat)
            const findNameValue = () => {
                // Definisi urutan prioritas label yang ingin dicari
                const priorityLabels = ['penerima', 'nama'];
                
                // Tahap 1: Pencarian Exact Match (Sama Persis)
                for (const target of priorityLabels) {
                    const found = config.find(el => el.label?.toLowerCase() === target);
                    if (found) {
                        const val = strukData[normalizeKey(found.label || "")];
                        // Pastikan nilainya ada dan tidak cuma spasi
                        if (val && val.trim() !== "") return val;
                    }
                }
        
                // Tahap 2: Pencarian Partial (Mengandung kata), tapi selektif
                for (const target of priorityLabels) {
                    const found = config.find(el => {
                        const labelLower = el.label?.toLowerCase() || "";
                        return (
                            labelLower.includes(target) && 
                            !labelLower.includes('toko') && // Abaikan "Nama Toko"
                            !labelLower.includes('bank')    // Abaikan "Nama Bank"
                        );
                    });
                    
                    if (found) {
                        const val = strukData[normalizeKey(found.label || "")];
                        if (val && val.trim() !== "") return val;
                    }
                }
        
                return null;
            };
        
            // Penggunaan Hirarki: Hasil Fungsi -> User -> Random Text
            const randomText = Math.random().toString(36).substring(2, 10).toUpperCase();
            const namaHistory = findNameValue() || strukData['user'] || randomText;
        
            // --- 2. Logika Pengambilan Total (Hirarki Revisi) ---
            const findTotalValue = () => {
                // A. Cari berdasarkan dataType 'total_keseluruhan' (Pertama ditemukan)
                const byDataType = config.find(el => el.dataType === 'total_keseluruhan');
                if (byDataType) return strukData[normalizeKey(byDataType.label || "")];
        
                // B. Cari berdasarkan Label (total, total keseluruhan, nominal, jumlah)
                // 2. Hirarki Ketat berdasarkan Label
                const priorityLabels = ['total', 'total keseluruhan', 'nominal', 'jumlah'];
                
                for (const label of priorityLabels) {
                    const found = config.find(el => el.label?.toLowerCase() === label);
                    if (found) {
                        const value = strukData[normalizeKey(found.label || "")];
                        // Jika ditemukan tapi isinya kosong, lanjut cari ke label berikutnya
                        if (value !== undefined && value !== "") return value;
                    }
                }
        
                // C. Cari berdasarkan dataType 'Currency' (Pertama ditemukan)
                const byCurrency = config.find(el => el.dataType === 'Currency');
                if (byCurrency) return strukData[normalizeKey(byCurrency.label || "")];
        
                return null;
            };
        
            const rawTotal = findTotalValue();
            // Konversi ke number: hapus semua karakter kecuali angka, titik, dan minus
            const finalTotal = rawTotal !== null && rawTotal !== "" 
                ? parseFloat(rawTotal.toString().replace(/[^0-9.-]/g, '')) 
                : null;

            // Simpan Ke History
            const saveInHistory = await createReceipt({
                nama: namaHistory,
                layoutId: configId,
                total: finalTotal,
                content: strukData
            });

            if(saveInHistory.success) {
                setShowModal(true);
            } else {
                setAlert({
                    'type': 'error',
                    'message': 'Gagal menyimpan data ke history'
                });
                return;
            }



        } catch (err) {
            console.error(err);
            setAlert({
                'type': 'error',
                'message': 'Terjadi kesahalan saat OCR, Coba lagi'
            });
        } finally {
            setIsGenerating(false);
        }
    }

    useEffect(() => {
        const nominalField = config.find(el => el.dataType === 'Nominal' || el.dataType === 'Currency');
        const nominalKey = nominalField ? normalizeKey(nominalField.label || "") : "";
        const nominalValue = Number(strukData[nominalKey]) || 0;

        let finalTotal = nominalValue;
        let updates: Record<string, any> = {};

        config.forEach((el) => {
            const key = normalizeKey(el.label || "");

            switch (el.dataType) {
                case 'Admin_Fee':
                    // Jika showAdmin false, paksa admin jadi 0 atau kosong
                    updates[key] = "0";
                    break;
                case 'total_keseluruhan':
                    updates[key] = finalTotal.toString();
                    break;
            }
        });

        if (settings) {
            const receiptMeta = getReceiptMetadata(nominalValue, settings);
            
            updates['logo'] = receiptMeta.logoPath;
            updates['reference_set'] = receiptMeta.reference_set;

            // Tentukan nilai total berdasarkan showAdmin
            finalTotal = strukData.showAdmin 
                ? receiptMeta.totalAmount 
                : nominalValue;

            config.forEach((el) => {
                const key = normalizeKey(el.label || "");

                switch (el.dataType) {
                    case 'Store_Name':
                        updates[key] = receiptMeta.shopName;
                        break;
                    case 'Admin_Fee':
                        // Jika showAdmin false, paksa admin jadi 0 atau kosong
                        console.log(receiptMeta.adminFee)
                        updates[key] = strukData.showAdmin ? receiptMeta.adminFee.toString() : "0";
                        break;
                    case 'total_keseluruhan':
                        updates[key] = finalTotal.toString();
                        break;
                }
            });

        }

        setStrukData(prev => ({
            ...prev,
            ...updates
        }));
    }, [
        strukData[normalizeKey(config.find(el => el.dataType === 'Currency' || el.dataType === 'Nominal')?.label || "")] , 
        settings,
        strukData.showAdmin // Trigger ulang saat toggle berubah
    ]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Unggah Struk Anda
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                    Unggah gambar struk Anda untuk membuat struk baru dari awal.
                </p>
            </header>

            {alert?.message && <AlertLine message={alert.message} type={alert.type} className='mb-3' />}

            <div className="flex flex-col h-full">
                <div className="flex items-center min-h-[40px]">
                    <label className="block text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">Unggah Struk</label>
                </div>
                <div className="flex-grow">
                    <div className="group relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl h-44 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition overflow-hidden">
                    {previews.struk_image ? (
                        <img src={previews.struk_image} className="h-full w-full object-contain p-4" alt="Struk Preview" />
                    ) : (
                        <>
                        <Upload className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-3 font-semibold text-center px-4">Pilih gambar struk (JPG, PNG)</p>
                        </>
                    )}
                    <input type="file" accept="image/*" name='struk_image' onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <p className="text-sm text-red-500 h-4 invisible mt-2">Error: File struk wajib diunggah</p>
                </div>
                
                <Checkbox
                    label="Tampilkan Biaya Admin"
                    checked={strukData.showAdmin}
                    onChange={() => 
                            setStrukData((prev) => ({
                            ...prev, 
                            showAdmin: !prev.showAdmin 
                        }))
                    }
                />
            </div>

            <div className="mt-5">
                <button onClick={handleSubmit} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-5 px-8 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3">
                    {isGenerating ? <Loader2 className="animate-spin" /> : <FileText />}
                    {isGenerating ? "MENGOLAH DATA..." : "BUAT STRUK SEKARANG"}
            </button>
            </div>

            <PreviewModal
                show={showModal}
                onClose={() => setShowModal(false)}
                // Gunakan strukData yang sudah berisi hasil ekstraksi AI
                formData={strukData} 
                setFormData={setStrukData}
                isGenerating={isGenerating}
                config={config}
                setIsGenerating={setIsGenerating}
            />
        </div>
        
    )
}

export default PageUploadStrukClient
