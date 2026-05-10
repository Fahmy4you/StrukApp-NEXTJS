import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, targetFields } = await req.json();
    
    if (!imageBase64) return NextResponse.json({ error: "Gambar kosong" }, { status: 400 });

    // 1. Bangun Skema JSON Dinamis berdasarkan targetFields dari Frontend
    // targetFields berisi: [{ label: "NAMA", key: "nama", dataType: "String" }, ...]
    const fieldStructure = targetFields.reduce((acc: any, field: any) => {
      acc[field.key] = `Isi dengan data ${field.label} yang ditemukan di struk`;
      return acc;
    }, {});

    // 2. Buat Prompt yang memerintahkan AI mengikuti struktur tersebut
    const prompt = `Analisis struk ini dengan sangat teliti. 
    Ekstrak informasi yang diminta dan kembalikan HANYA dalam format JSON murni.
    Gunakan key berikut:
    ${JSON.stringify(fieldStructure, null, 2)}
    
    Catatan khusus:
    - Untuk nominal/angka/currency, kembalikan hanya angka (number) atau string angka murni.
    - Jika data tidak ditemukan, isi dengan null.
    - Status harus berisi "BERHASIL" atau "GAGAL".`;

    const contents = [
      { 
        inlineData: { 
          mimeType: mimeType || "image/jpeg", 
          data: imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64 
        } 
      },
      { text: prompt },
    ];

    // DAFTAR MODEL FAILOVER
    const availableModels = [
      "gemini-3-flash-preview", 
      "gemini-3.1-flash-lite-preview", 
      "gemini-2.5-flash-lite-preview"
    ];

    let lastError;
    
    for (const modelName of availableModels) {
      try {
        console.log(`Mencoba model: ${modelName}`);
        
        // Perhatikan: Library @google/generative-ai biasanya menggunakan method generateContent
        const result = await ai.models.generateContent({
          model: modelName,
          contents: contents,
        });

        if(!result || !result.text) throw new Error("Response tidak valid");
        const text = result.text;

        // 3. Parsing JSON secara aman
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const extractedData = JSON.parse(cleanJson);

        return NextResponse.json({ 
          success: true, 
          extractedData, 
          modelUsed: modelName 
        });
        
      } catch (error: any) {
        lastError = error;
        if (error.status === 429) {
          console.warn(`Model ${modelName} limit tercapai, mencoba cadangan...`);
          continue;
        }
        throw error;
      }
    }

    throw lastError;

  } catch (error: any) {
    console.error("Final Error Vision:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses" }, { status: 500 });
  }
}