// Benita Granites — Cloudinary Upload Helper
import { CLOUDINARY_CONFIG } from '@/constants';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload an image file to Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  folder?: string,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  if (folder) {
    formData.append('folder', `benitagranites/${folder}`);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_CONFIG.uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          secure_url: response.secure_url,
          public_id: response.public_id,
          width: response.width,
          height: response.height,
          format: response.format,
          bytes: response.bytes,
        });
      } else {
        reject(new Error('Upload failed. Please try again.'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload. Check your connection.'));
    };

    xhr.send(formData);
  });
}

/**
 * Compress image before upload (client-side)
 */
export function compressImage(
  file: File,
  maxWidth = 1920,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
}
