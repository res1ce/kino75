import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const allowedExtensions = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
]);

function sanitizeFolder(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return 'uploads';
  return value.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'uploads';
}

function getSafeFileName(originalName: string) {
  const parsed = path.parse(originalName);
  const extension = parsed.ext.toLowerCase();
  const baseName = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return `${Date.now()}-${baseName || 'file'}${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Файл больше 50 МБ' }, { status: 400 });
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      return NextResponse.json({ error: 'Недопустимый тип файла' }, { status: 400 });
    }

    const folder = sanitizeFolder(formData.get('folder'));
    const safeFileName = getSafeFileName(file.name);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    const filePath = path.join(uploadDir, safeFileName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      fileUrl: `/uploads/${folder}/${safeFileName}`,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Ошибка при загрузке файла' }, { status: 500 });
  }
}
