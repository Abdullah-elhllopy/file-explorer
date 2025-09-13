import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { findFolder } from '@/lib/data';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const folder = findFolder(params.id);
  if (!folder) {
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
  }
  return NextResponse.json(folder);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name } = await req.json();
  const parent = findFolder(params.id);
  
  if (!parent || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Check if folder with same name already exists
  const existingFolder = parent.children.find(
    child => child.name.toLowerCase() === name.trim().toLowerCase() && child.type === 'folder'
  );
  
  if (existingFolder) {
    return NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 });
  }

  // Create new folder with proper parent reference
  const newFolder = {
    id: Date.now().toString(),
    name: name.trim(),
    type: 'folder' as const,
    children: [],
    parentId: params.id
  };

  parent.children.push(newFolder);
  
  // Revalidate all relevant paths
  revalidatePath('/');
  revalidatePath(`/folder/${params.id}`);
  revalidatePath('/recent');
  
  return NextResponse.json({ success: true, folder: newFolder });
}