import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { formatIDR } from '@/lib/Helpers';
import { DefaultConfigLayout } from '@/lib/constanta';

const normalizeKey = (label?: string) => label ? label.toLowerCase().trim().replace(/\s+/g, '_') : '';

// Daftarkan helper jika belum ada
if (!Handlebars.helpers.eq) {
    Handlebars.registerHelper('eq', (a, b) => a === b);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Ambil 'downloadType' dari client (default ke pdf jika tidak ada)
        let { formData, config, format = 'pdf' } = body;
        
        const { protocol, host } = new URL(req.url);
        const baseUrl = `${protocol}//${host}`;

        if (!config) {
            config = DefaultConfigLayout;
        }

        // 1. Mapping Elemen Dinamis
        const mappedElements = config.map((el: any) => {
            const key = normalizeKey(el.label);
            
            if (el.type === 'input_image') {
                let logoSrc = formData.logo_image || formData.logo || el.value || "";
                if (logoSrc && logoSrc.startsWith('/')) {
                    logoSrc = `${baseUrl}${logoSrc}`;
                }
                return { isLogo: true, src: logoSrc, width: el.width || 80, height: el.height || 80 };
            }

            if (el.type === 'text') {
                return { isTitle: true, value: el.value, alignment: el.alignment || 'center', fontSize: el.fontSize || 14, fontWeight: el.fontWeight || 'bold', color: el.color || '#000', hasBorder: el.hasBorder };
            }

            if (el.type === 'separator') {
                return { isSeparator: true, borderType: el.style === 'dash' ? 'dashed' : 'solid', color: el.color || '#000' };
            }

            if (formData.showAdmin === false && el.dataType === 'Admin_Fee') {
                return null;
            }

            if (el.type === 'input_text') {
                let rawValue = formData[key] || el.exampleValue || "-";
                const currencyTypes = ['Nominal', 'Admin_Fee', 'total_keseluruhan', 'Currency', 'Admin_fee'];
                if (currencyTypes.includes(el.dataType)) {
                    const cleanNum = String(rawValue).replace(/[^0-9.-]/g, '');
                    rawValue = `Rp ${formatIDR(cleanNum)}`;
                }

                return {
                    isInput: true,
                    label: el.label,
                    value: rawValue,
                    showLabel: el.showLabel,
                    fontSize: el.fontSize || 12,
                    fontWeight: el.fontWeight || 'normal',
                    color: el.color || '#000',
                    isStacked: el.labelLayout === 'stacked',
                    isCentered: el.position === 'center',
                    isTotal: el.dataType === 'total_keseluruhan',
                    hasBorder: el.hasBorder
                };
            }
            return null;
        }).filter(Boolean);

        // 2. Load & Compile Template
        const templatePath = path.join(process.cwd(), 'src', 'templates', 'struk_template.html');
        const templateSource = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(templateSource);
        const finalHtml = template({ elements: mappedElements });

        // 3. Puppeteer Processing
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        // Atur viewport khusus untuk image agar resolusi tajam
        if (format == 'png') {
            await page.setViewport({ width: 375, height: 800, deviceScaleFactor: 2 });
        }
        
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
        const height = await page.evaluate(() => document.documentElement.offsetHeight);

        let buffer: Buffer;
        let contentType: string;
        let fileExtension: string;

        if (format == 'png') {
            // --- GENERATE PNG ---
            const element = await page.$('.receipt'); 
            if (!element) throw new Error("Element .receipt tidak ditemukan");

            const screenshot = await element.screenshot({
                type: 'png',
                omitBackground: false 
            });
            buffer = Buffer.from(screenshot);
            contentType = "image/png";
            fileExtension = "png";
        } else {
            // --- GENERATE PDF ---
            const pdf = await page.pdf({
                printBackground: true,
                width: '58mm',
                height: `${height + 20}px`,
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
            });
            buffer = Buffer.from(pdf);
            contentType = "application/pdf";
            fileExtension = "pdf";
        }

        await browser.close();

        return new Response(new Uint8Array(buffer), {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename=struk-${Date.now()}.${fileExtension}`,
            },
        });

    } catch (error: any) {
        console.error("Download Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}