#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts and compresses existing large images to WebP format
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CONFIG = {
  // Source directories to optimize
  sourceDirs: [
    'src/assets/imagesCarousel',
    'src/assets/client-logo',
    'public/Logo'
  ],
  // Output quality settings
  webpQuality: 85,
  jpegQuality: 85,
  // Max dimensions
  maxWidth: 1920,
  maxHeight: 1080,
  // File size thresholds
  minOptimizationSize: 100 * 1024, // 100KB - only optimize larger files
  targetMaxSize: 500 * 1024, // 500KB target
};

async function optimizeImage(inputPath, outputPath, options = {}) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    console.log(`\nOptimizing: ${inputPath}`);
    console.log(`Original size: ${formatFileSize(originalSize)}`);
    
    // Skip if file is already small enough
    if (originalSize < CONFIG.minOptimizationSize) {
      console.log(`⏭️  Skipping (already small enough)`);
      return { skipped: true, originalSize, optimizedSize: originalSize };
    }
    
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Calculate new dimensions maintaining aspect ratio
    let { width, height } = metadata;
    if (width > CONFIG.maxWidth || height > CONFIG.maxHeight) {
      const aspectRatio = width / height;
      
      if (width > CONFIG.maxWidth) {
        width = CONFIG.maxWidth;
        height = Math.round(width / aspectRatio);
      }
      
      if (height > CONFIG.maxHeight) {
        height = CONFIG.maxHeight;
        width = Math.round(height * aspectRatio);
      }
    }
    
    // Determine output format and quality
    const isWebp = outputPath.endsWith('.webp');
    const quality = isWebp ? CONFIG.webpQuality : CONFIG.jpegQuality;
    
    // Process the image
    let pipeline = image.resize(width, height, {
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true
    });
    
    if (isWebp) {
      pipeline = pipeline.webp({ quality, effort: 6 });
    } else {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }
    
    await pipeline.toFile(outputPath);
    
    const optimizedStats = fs.statSync(outputPath);
    const optimizedSize = optimizedStats.size;
    const reduction = Math.round(((originalSize - optimizedSize) / originalSize) * 100);
    
    console.log(`✅ Optimized size: ${formatFileSize(optimizedSize)} (${reduction}% reduction)`);
    console.log(`📐 Dimensions: ${width}x${height}`);
    
    return { 
      success: true, 
      originalSize, 
      optimizedSize, 
      reduction,
      dimensions: `${width}x${height}`
    };
    
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
    return { error: error.message, originalSize: 0, optimizedSize: 0 };
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function optimizeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return { processed: 0, totalSaved: 0 };
  }
  
  console.log(`\n📁 Processing directory: ${dirPath}`);
  
  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file)
  );
  
  if (imageFiles.length === 0) {
    console.log(`ℹ️  No images to optimize in ${dirPath}`);
    return { processed: 0, totalSaved: 0 };
  }
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let processed = 0;
  
  for (const file of imageFiles) {
    const inputPath = path.join(dirPath, file);
    const outputFileName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = path.join(dirPath, outputFileName);
    
    const result = await optimizeImage(inputPath, outputPath);
    
    if (result.success || result.skipped) {
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
      processed++;
      
      // If optimization was successful and significant, consider removing original
      if (result.success && result.reduction > 50 && result.originalSize > 1024 * 1024) {
        console.log(`🗑️  Consider removing original: ${inputPath}`);
      }
    }
  }
  
  const totalSaved = totalOriginalSize - totalOptimizedSize;
  
  console.log(`\n📊 Directory Summary:`);
  console.log(`   Processed: ${processed} files`);
  console.log(`   Original total: ${formatFileSize(totalOriginalSize)}`);
  console.log(`   Optimized total: ${formatFileSize(totalOptimizedSize)}`);
  console.log(`   Total saved: ${formatFileSize(totalSaved)}`);
  
  return { processed, totalSaved };
}

async function main() {
  console.log('🚀 Starting image optimization...\n');
  
  let totalProcessed = 0;
  let totalSaved = 0;
  
  for (const dir of CONFIG.sourceDirs) {
    const result = await optimizeDirectory(dir);
    totalProcessed += result.processed;
    totalSaved += result.totalSaved;
  }
  
  console.log(`\n🎉 Optimization Complete!`);
  console.log(`📊 Final Summary:`);
  console.log(`   Total files processed: ${totalProcessed}`);
  console.log(`   Total bandwidth saved: ${formatFileSize(totalSaved)}`);
  console.log(`   Estimated monthly savings: ${formatFileSize(totalSaved * 100)} (assuming 100 page views)`);
  
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Update your image imports to use .webp files`);
  console.log(`   2. Test the optimized images in your application`);
  console.log(`   3. Remove original large files if optimization was successful`);
  console.log(`   4. Update Gallery component to use responsive loading`);
}

// Run the optimization
main().catch(console.error);
