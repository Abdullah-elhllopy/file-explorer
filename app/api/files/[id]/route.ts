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

  // Check if file with same name already exists in this folder
  const existingFile = parent.children.find(
    child => child.name.toLowerCase() === safeName.toLowerCase() && child.type === 'file'
  );
  
  if (existingFile) {
    // Generate unique name with timestamp
    const nameWithoutExt = safeName.substring(0, safeName.lastIndexOf('.')) || safeName;
    const extension = extname(safeName);
    const timestamp = Date.now();
    const uniqueName = `${nameWithoutExt}_${timestamp}${extension}`;
    finalName = uniqueName;
  }

  const publicDir = join(process.cwd(), 'public');
  
  // Create a unique filename for the filesystem to avoid conflicts
  const fileId = Date.now().toString();
  const fileExtension = extname(finalName);
  const fileSystemName = `${fileId}${fileExtension}`;
  const filePath = join(publicDir, fileSystemName);

  try {
    // Ensure public directory exists
    await mkdir(publicDir, { recursive: true });
    
    // Write file to filesystem with unique name
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes), { flag: 'wx' });
  } catch (err: any) {
    console.error('Failed to create file in public folder:', err);
    if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'EEXIST') {
      return NextResponse.json({ error: 'File already exists in public folder' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }

  // Add to in-memory structure with display name but track filesystem name
  const newFile = {
    id: fileId,
    name: finalName, // Display name
    type: 'file' as const,
    fileSystemName: fileSystemName, // Internal filesystem name
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };

  parent.children.push(newFile);  
  // Revalidate paths
  revalidatePath('/');
  revalidatePath(`/folder/${params.id}`);
  revalidatePath('/recent');
  
  return NextResponse.json({ success: true, file: newFile });
}