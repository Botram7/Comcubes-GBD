import { Storage } from '@google-cloud/storage';

// Replit Object Storage configuration
const storage = new Storage({
  credentials: {
    type: 'external_account',
    audience: 'replit',
    subject_token_type: 'access_token',
    token_url: 'http://127.0.0.1:1106/token',
    credential_source: {
      url: 'http://127.0.0.1:1106/credential',
      format: {
        type: 'json',
        subject_token_field_name: 'access_token'
      }
    },
    universe_domain: 'googleapis.com'
  },
  projectId: ''
});

// Get bucket from environment variable
const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const bucket = storage.bucket(bucketName);

export class ObjectStorageService {
  
  // Serve a file from object storage
  async streamFile(objectPath, res) {
    try {
      const file = bucket.file(`public/generated_images/${objectPath}`);
      const [exists] = await file.exists();
      
      if (!exists) {
        return res.status(404).send('Image not found');
      }

      // Get file metadata for proper headers
      const [metadata] = await file.getMetadata();
      
      // Set appropriate headers
      res.set({
        'Content-Type': metadata.contentType || 'image/png',
        'Content-Length': metadata.size,
        'Cache-Control': 'public, max-age=3600'
      });

      // Stream the file
      const stream = file.createReadStream();
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).send('Error streaming file');
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error('Error serving file from object storage:', error);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
    }
  }

  // Upload a file to object storage
  async uploadFile(localPath, objectPath) {
    try {
      const file = bucket.file(`public/generated_images/${objectPath}`);
      await bucket.upload(localPath, {
        destination: file,
        metadata: {
          cacheControl: 'public, max-age=3600'
        }
      });
      console.log(`Uploaded ${localPath} to ${objectPath}`);
      return true;
    } catch (error) {
      console.error('Error uploading file:', error);
      return false;
    }
  }
}

export const objectStorageService = new ObjectStorageService();