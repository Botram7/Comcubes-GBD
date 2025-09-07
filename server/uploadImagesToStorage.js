import { objectStorageService } from './objectStorageService.js';
import fs from 'fs';
import path from 'path';

async function uploadAllImages() {
  const imagesDir = path.resolve(import.meta.dirname, '..', 'attached_assets', 'generated_images');
  
  console.log('Starting bulk upload of images to Object Storage...');
  console.log(`Images directory: ${imagesDir}`);
  
  try {
    const files = fs.readdirSync(imagesDir);
    console.log(`Found ${files.length} images to upload`);
    
    let uploaded = 0;
    let failed = 0;
    
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        const localPath = path.join(imagesDir, file);
        const success = await objectStorageService.uploadFile(localPath, file);
        
        if (success) {
          uploaded++;
          if (uploaded % 10 === 0) {
            console.log(`Uploaded ${uploaded}/${files.length} images...`);
          }
        } else {
          failed++;
          console.error(`Failed to upload: ${file}`);
        }
      }
    }
    
    console.log(`Upload complete! Uploaded: ${uploaded}, Failed: ${failed}`);
    
  } catch (error) {
    console.error('Error during bulk upload:', error);
  }
}

// Run the upload
uploadAllImages();