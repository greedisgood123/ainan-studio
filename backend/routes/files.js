import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
// Generate unique filename using timestamp and random number
const generateUniqueName = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/temp';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${generateUniqueName()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|webp|gif|mp4|webm|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// Image optimization function
const optimizeImage = async (inputPath, outputPath, options = {}) => {
  const {
    width = 1920,
    height = 1080,
    quality = 85,
    format = 'webp'
  } = options;

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    let pipeline = image;

    // Resize if needed
    if (metadata.width > width || metadata.height > height) {
      pipeline = pipeline.resize(width, height, {
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    // Convert and compress
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality, effort: 6 });
    } else if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }

    await pipeline.toFile(outputPath);

    // Get file sizes for comparison
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const reduction = Math.round(((originalSize - optimizedSize) / originalSize) * 100);

    return {
      originalSize,
      optimizedSize,
      reduction,
      success: true
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    throw error;
  }
};

// Upload endpoint
router.post('/upload', authenticateAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { category = 'general', optimize = 'true' } = req.body;
    const shouldOptimize = optimize === 'true';

    const originalPath = req.file.path;
    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase();
    
    // Determine destination folder
    let destFolder = 'general';
    if (['portfolio', 'gallery', 'logos'].includes(category)) {
      destFolder = category;
    }

    const destDir = `./uploads/${destFolder}`;
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    let finalPath;
    let optimizationResult = null;

    // Handle image optimization
    if (shouldOptimize && ['.jpg', '.jpeg', '.png'].includes(ext)) {
      const optimizedName = `${path.parse(originalName).name}-optimized.webp`;
      finalPath = path.join(destDir, optimizedName);
      
      optimizationResult = await optimizeImage(originalPath, finalPath, {
        width: category === 'logos' ? 400 : 1920,
        height: category === 'logos' ? 400 : 1080,
        quality: 85,
        format: 'webp'
      });

      // Remove original temp file
      fs.unlinkSync(originalPath);
    } else {
      // Move file without optimization
      const fileName = `${uuidv4()}-${Date.now()}${ext}`;
      finalPath = path.join(destDir, fileName);
      fs.renameSync(originalPath, finalPath);
    }

    // Generate public URL
    const publicUrl = finalPath.replace(/\\/g, '/').replace('./uploads/', '/uploads/');

    res.json({
      url: publicUrl,
      originalName,
      category,
      size: fs.statSync(finalPath).size,
      optimization: optimizationResult,
      message: optimizationResult 
        ? `File optimized: ${optimizationResult.reduction}% size reduction`
        : 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: error.message || 'Upload failed',
      details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Multiple file upload
router.post('/upload-multiple', authenticateAdmin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { category = 'general', optimize = 'true' } = req.body;
    const shouldOptimize = optimize === 'true';
    const results = [];

    for (const file of req.files) {
      try {
        const originalPath = file.path;
        const originalName = file.originalname;
        const ext = path.extname(originalName).toLowerCase();
        
        let destFolder = 'general';
        if (['portfolio', 'gallery', 'logos'].includes(category)) {
          destFolder = category;
        }

        const destDir = `./uploads/${destFolder}`;
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        let finalPath;
        let optimizationResult = null;

        if (shouldOptimize && ['.jpg', '.jpeg', '.png'].includes(ext)) {
          const optimizedName = `${path.parse(originalName).name}-optimized.webp`;
          finalPath = path.join(destDir, optimizedName);
          
          optimizationResult = await optimizeImage(originalPath, finalPath);
          fs.unlinkSync(originalPath);
        } else {
          const fileName = `${uuidv4()}-${Date.now()}${ext}`;
          finalPath = path.join(destDir, fileName);
          fs.renameSync(originalPath, finalPath);
        }

        const publicUrl = finalPath.replace(/\\/g, '/').replace('./uploads/', '/uploads/');

        results.push({
          url: publicUrl,
          originalName,
          category,
          size: fs.statSync(finalPath).size,
          optimization: optimizationResult,
          success: true
        });

      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        results.push({
          originalName: file.originalname,
          error: error.message,
          success: false
        });

        // Clean up temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.json({
      message: `Processed ${results.length} files`,
      results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Multiple upload failed' });
  }
});

// Delete file endpoint
router.delete('/delete', authenticateAdmin, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    // Convert URL to file path
    const filePath = url.replace('/uploads/', './uploads/');

    // Security check: ensure path is within uploads directory
    const resolvedPath = path.resolve(filePath);
    const uploadsPath = path.resolve('./uploads');
    
    if (!resolvedPath.startsWith(uploadsPath)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file
    fs.unlinkSync(resolvedPath);

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file info
router.get('/info', authenticateAdmin, async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    const filePath = url.replace('/uploads/', './uploads/');
    const resolvedPath = path.resolve(filePath);
    const uploadsPath = path.resolve('./uploads');
    
    if (!resolvedPath.startsWith(uploadsPath)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();

    res.json({
      url,
      size: stats.size,
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString(),
      extension: ext,
      type: ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? 'image' : 
            ['.mp4', '.webm', '.mov'].includes(ext) ? 'video' : 'other'
    });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

export default router;
