import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { findFolder, findParentFolder } from '@/lib/data';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { type: string; id: string } }
) {
    try {
        const { type, id } = params;
        console.log('Delete request:', { type, id });

        if (type === 'file') {
            return await deleteFile(id);
        } else if (type === 'folder') {
            return await deleteFolder(id);
        } else {
            return NextResponse.json({ error: 'Invalid type. Must be "file" or "folder"' }, { status: 400 });
        }
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({
            error: 'Failed to delete: ' + (error instanceof Error ? error.message : String(error))
        }, { status: 500 });
    }
}

async function deleteFile(fileId: string) {
    // Find the parent folder containing this file
    const parentFolder = findParentFolder(fileId);
    if (!parentFolder) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Find the file in the parent's children
    const fileIndex = parentFolder.children.findIndex(child => child.id === fileId && child.type === 'file');
    if (fileIndex === -1) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = parentFolder.children[fileIndex];

    try {
        // Delete the physical file from public directory
        const publicDir = join(process.cwd(), 'public');
        const filePath = join(publicDir, file.name);
        await unlink(filePath);
        console.log('Physical file deleted:', filePath);
    } catch (error) {
        console.warn('Could not delete physical file:', error);
        // Continue with deletion from memory even if physical file deletion fails
    }

    // Remove from in-memory structure
    parentFolder.children.splice(fileIndex, 1);

    // Revalidate paths
    revalidatePath('/');
    revalidatePath(`/folder/${parentFolder.id}`);
    revalidatePath('/recent');

    console.log('File deleted successfully:', file.name);
    return NextResponse.json({ success: true, message: `File "${file.name}" deleted successfully` });
}

async function deleteFolder(folderId: string) {
    // Prevent deletion of root folder
    if (folderId === 'root') {
        return NextResponse.json({ error: 'Cannot delete root folder' }, { status: 400 });
    }

    const parentFolder = findParentFolder(folderId);
    if (!parentFolder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const folderIndex = parentFolder.children.findIndex(child => child.id === folderId && child.type === 'folder');
    if (folderIndex === -1) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const folder = parentFolder.children[folderIndex];

    // Check if folder is empty
    if (folder.type === 'folder' && folder.children.length > 0) {
        return NextResponse.json({
            error: 'Cannot delete non-empty folder. Please delete all contents first.'
        }, { status: 400 });
    }

    // Remove from in-memory structure
    parentFolder.children.splice(folderIndex, 1);

    // Revalidate paths
    revalidatePath('/');
    revalidatePath(`/folder/${parentFolder.id}`);

    console.log('Folder deleted successfully:', folder.name);
    return NextResponse.json({ success: true, message: `Folder "${folder.name}" deleted successfully` });
}