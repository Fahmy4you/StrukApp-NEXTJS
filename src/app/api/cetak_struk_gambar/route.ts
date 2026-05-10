import { NextResponse } from 'next/server';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { mappedElements } = await req.json();
        const templatePath = path.join(process.cwd(), 'src', 'templates', 'struk_template.html');
        const templateSource = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(templateSource);
        
        // Return HTML murni yang sudah di-inject data
        const html = template({ elements: mappedElements });
        return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}