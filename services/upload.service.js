/**
 * Upload Service
 * Handles file uploads, validation, processing, and storage
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // For image processing (install: npm install sharp)

class UploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../database/uploads');
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    // Create upload directories
    this.initUploadDirs();
  }

  /**
   * Initialize upload directories
   */
  initUploadDirs() {
    const dirs = [
      this.uploadDir,
      path.join(this.uploadDir, 'avatars'),
      path.join(this.uploadDir, 'products'),
      path.join(this.uploadDir, 'restaurants'),
      path.join(this.uploadDir, 'categories'),
      path.join(this.uploadDir, 'temp')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
  }

  /**
   * Configure multer storage
   */
  getMulterStorage(folder = 'temp') {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(this.uploadDir, folder);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    });
  }

  /**
   * File filter for multer
   */
  fileFilter(req, file, cb) {
    if (this.allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${this.allowedImageTypes.join(', ')}`), false);
    }
  }

  /**
   * Get multer middleware for single file upload
   */
  getSingleUpload(fieldName = 'image', folder = 'temp') {
    return multer({
      storage: this.getMulterStorage(folder),
      fileFilter: this.fileFilter.bind(this),
      limits: {
        fileSize: this.maxFileSize
      }
    }).single(fieldName);
  }

  /**
   * Get multer middleware for multiple files upload
   */
  getMultipleUpload(fieldName = 'images', maxCount = 5, folder = 'temp') {
    return multer({
      storage: this.getMulterStorage(folder),
      fileFilter: this.fileFilter.bind(this),
      limits: {
        fileSize: this.maxFileSize
      }
    }).array(fieldName, maxCount);
  }

  /**
   * Process uploaded image
   * @param {string} filePath - Path to uploaded file
   * @param {object} options - Processing options
   */
  async processImage(filePath, options = {}) {
    try {
      const {
        width = null,
        height = null,
        quality = 80,
        format = 'jpeg',
        fit = 'cover'
      } = options;

      const processedPath = filePath.replace(
        path.extname(filePath),
        `-processed.${format}`
      );

      let sharpInstance = sharp(filePath);

      // Resize if dimensions provided
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, { fit });
      }

      // Convert format and compress
      if (format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality });
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({ quality });
      } else if (format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality });
      }

      await sharpInstance.toFile(processedPath);

      // Delete original file
      fs.unlinkSync(filePath);

      return {
        success: true,
        filePath: processedPath,
        filename: path.basename(processedPath)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file, userId) {
    try {
      // Move to avatars folder
      const newPath = path.join(this.uploadDir, 'avatars', `user-${userId}-${Date.now()}.jpeg`);

      // Process: resize to 200x200
      const result = await this.processImage(file.path, {
        width: 200,
        height: 200,
        quality: 85,
        format: 'jpeg',
        fit: 'cover'
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Move processed file
      fs.renameSync(result.filePath, newPath);

      // Generate URL
      const url = `/uploads/avatars/${path.basename(newPath)}`;

      return {
        success: true,
        url,
        filename: path.basename(newPath),
        path: newPath
      };
    } catch (error) {
      // Cleanup on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  /**
   * Upload product image
   */
  async uploadProductImage(file, productId) {
    try {
      const newPath = path.join(this.uploadDir, 'products', `product-${productId}-${Date.now()}.jpeg`);

      // Process: resize to 800x600
      const result = await this.processImage(file.path, {
        width: 800,
        height: 600,
        quality: 80,
        format: 'jpeg'
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      fs.renameSync(result.filePath, newPath);

      const url = `/uploads/products/${path.basename(newPath)}`;

      return {
        success: true,
        url,
        filename: path.basename(newPath),
        path: newPath
      };
    } catch (error) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  /**
   * Upload restaurant image
   */
  async uploadRestaurantImage(file, restaurantId) {
    try {
      const newPath = path.join(this.uploadDir, 'restaurants', `restaurant-${restaurantId}-${Date.now()}.jpeg`);

      // Process: resize to 1200x800
      const result = await this.processImage(file.path, {
        width: 1200,
        height: 800,
        quality: 85,
        format: 'jpeg'
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      fs.renameSync(result.filePath, newPath);

      const url = `/uploads/restaurants/${path.basename(newPath)}`;

      return {
        success: true,
        url,
        filename: path.basename(newPath),
        path: newPath
      };
    } catch (error) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  /**
   * Upload category image
   */
  async uploadCategoryImage(file, categoryId) {
    try {
      const newPath = path.join(this.uploadDir, 'categories', `category-${categoryId}-${Date.now()}.jpeg`);

      // Process: resize to 400x300
      const result = await this.processImage(file.path, {
        width: 400,
        height: 300,
        quality: 80,
        format: 'jpeg'
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      fs.renameSync(result.filePath, newPath);

      const url = `/uploads/categories/${path.basename(newPath)}`;

      return {
        success: true,
        url,
        filename: path.basename(newPath),
        path: newPath
      };
    } catch (error) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(url) {
    try {
      // Extract path from URL
      const filename = url.split('/').pop();
      const folder = url.split('/').slice(-2, -1)[0];
      const filePath = path.join(this.uploadDir, folder, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return {
          success: true,
          message: 'File deleted successfully'
        };
      }

      return {
        success: false,
        message: 'File not found'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(url) {
    try {
      const filename = url.split('/').pop();
      const folder = url.split('/').slice(-2, -1)[0];
      const filePath = path.join(this.uploadDir, folder, filename);

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'File not found'
        };
      }

      const stats = fs.statSync(filePath);

      return {
        success: true,
        data: {
          filename,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: filePath
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cleanup old files (older than X days)
   */
  async cleanupOldFiles(days = 30) {
    const folders = ['avatars', 'products', 'restaurants', 'categories', 'temp'];
    const now = Date.now();
    const maxAge = days * 24 * 60 * 60 * 1000; // Convert to milliseconds
    let deletedCount = 0;

    for (const folder of folders) {
      const folderPath = path.join(this.uploadDir, folder);
      const files = fs.readdirSync(folderPath);

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    }

    return {
      success: true,
      message: `Deleted ${deletedCount} old files`,
      deletedCount
    };
  }

  /**
   * Get storage stats
   */
  async getStorageStats() {
    const folders = ['avatars', 'products', 'restaurants', 'categories', 'temp'];
    const stats = {
      totalSize: 0,
      totalFiles: 0,
      byFolder: {}
    };

    for (const folder of folders) {
      const folderPath = path.join(this.uploadDir, folder);
      const files = fs.readdirSync(folderPath);

      let folderSize = 0;
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const fileStats = fs.statSync(filePath);
        folderSize += fileStats.size;
      }

      stats.byFolder[folder] = {
        files: files.length,
        size: folderSize,
        sizeFormatted: this.formatBytes(folderSize)
      };

      stats.totalFiles += files.length;
      stats.totalSize += folderSize;
    }

    stats.totalSizeFormatted = this.formatBytes(stats.totalSize);

    return {
      success: true,
      data: stats
    };
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

module.exports = new UploadService();