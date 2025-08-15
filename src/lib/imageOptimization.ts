/**
 * Image Optimization Utilities
 * Handles client-side image compression and optimization
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  maintainAspectRatio?: boolean;
}

export const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'webp',
  maintainAspectRatio: true,
};

/**
 * Compress and optimize image file on the client side
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (opts.maintainAspectRatio) {
          const aspectRatio = width / height;
          
          if (width > opts.maxWidth!) {
            width = opts.maxWidth!;
            height = width / aspectRatio;
          }
          
          if (height > opts.maxHeight!) {
            height = opts.maxHeight!;
            width = height * aspectRatio;
          }
        } else {
          width = Math.min(width, opts.maxWidth!);
          height = Math.min(height, opts.maxHeight!);
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx!.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Create new file with optimized blob
            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, `.${opts.format}`),
              {
                type: `image/${opts.format}`,
                lastModified: Date.now(),
              }
            );
            
            resolve(optimizedFile);
          },
          `image/${opts.format}`,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate compression ratio
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): number {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 50 * 1024 * 1024; // 50MB max
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)',
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 50MB',
    };
  }
  
  return { isValid: true };
}

/**
 * Generate responsive image sizes
 */
export function generateResponsiveSizes(originalWidth: number): number[] {
  const sizes = [640, 768, 1024, 1280, 1920];
  return sizes.filter(size => size <= originalWidth);
}

/**
 * Create srcSet string for responsive images
 */
export function createSrcSet(baseUrl: string, sizes: number[]): string {
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
}
