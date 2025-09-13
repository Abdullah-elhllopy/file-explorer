import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { findFolder } from '@/lib/data';
import { writeFile, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';

export const runtime = 'nodejs';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const providedName = formData.get('name')?.toString();
  const parent = findFolder(params.id);
  
  if (!parent || !file) {
    return NextResponse.json({ error: 'Invalid request: missing parent or file' }, { status: 400 });
  }

  // Validate file size (limit to 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 413 });
  }

  // Determine filename
  let finalName: string;
  if (providedName && providedName.trim()) {
    const customName = providedName.trim();
    const originalExt = extname(file.name);
    const customExt = extname(customName);
    
    // If custom name doesn't have extension, add the original one
    finalName = customExt ? customName : `${customName}${originalExt}`;
  } else {
    finalName = file.name;
  }

  const safeName = basename(finalName);
  if (!safeName) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
  }

  // Check if file with same name already exists
  const existingFile = parent.children.find(
    child => child.name.toLowerCase() === safeName.toLowerCase() && child.type === 'file'
  );
  
  if (existingFile) {
    return NextResponse.json({ error: 'A file with this name already exists' }, { status: 409 });
  }

  const publicDir = join(process.cwd(), 'public');
  const filePath = join(publicDir, safeName +  Date.now().toString());

  try {
    // Ensure public directory exists
    await mkdir(publicDir, { recursive: true });
    
    // Write file (fail if it already exists in filesystem)
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes), { flag: 'wx' });
  } catch (err: any) {
    console.error('Failed to create file in public folder:', err);
    if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'EEXIST') {
      return NextResponse.json({ error: 'File already exists in public folder' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }

  // Add to in-memory structure
  const newFile = {
    id: Date.now().toString(),
    name: safeName,
    type: 'file' as const,
  };

  parent.children.push(newFile);
  
  // Revalidate paths
  revalidatePath('/');
  revalidatePath(`/folder/${params.id}`);
  revalidatePath('/recent');
  
  return NextResponse.json({ success: true, file: newFile });
}