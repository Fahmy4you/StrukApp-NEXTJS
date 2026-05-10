export const DownloadStruk = async (formData: any, config: any, format: 'pdf' | 'png' = 'pdf') => {
    const res = await fetch("/api/cetak_struk", { // Sesuaikan route API Anda
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, config, format }),
    });

    if (!res.ok) throw new Error("Gagal generate file");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `struk-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, 100);
};

import html2canvas from 'html2canvas';

export const DownloadStrukAsImage = async (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) throw new Error("Elemen struk tidak ditemukan");

    try {
        const canvas = await html2canvas(element, {
            scale: 3, // Membuat gambar sangat tajam (High Resolution)
            useCORS: true, // Agar logo dari URL luar bisa muncul
            allowTaint: true,
            backgroundColor: "#ffffff", // Memastikan background putih, bukan hitam/transparan
        });

        const imageData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imageData;
        link.download = `struk-${Date.now()}.png`;
        link.click();
    } catch (error) {
        console.error("Gagal convert ke gambar:", error);
    }
};