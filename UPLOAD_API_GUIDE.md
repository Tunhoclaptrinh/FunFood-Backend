# 📤 Upload API - Complete Guide

## Overview

FunFood API hỗ trợ upload ảnh cho:

- ✅ Avatar (User)
- ✅ Product Images
- ✅ Restaurant Images
- ✅ Category Images

## Features

- **Image Processing**: Auto resize, compress, format conversion
- **Validation**: File type, size, permissions
- **Storage**: Organized folder structure
- **Cleanup**: Auto delete old files
- **Statistics**: Storage usage tracking

---

## 1. Upload Avatar

Upload và cập nhật avatar của user hiện tại.

### Endpoint

```
POST /api/upload/avatar
```

### Headers

```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

### Body (Form Data)

```
image: [File] (image file)
```

### Response

```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "url": "/uploads/avatars/user-2-1234567890.jpeg",
    "filename": "user-2-1234567890.jpeg",
    "user": {
      "id": 2,
      "name": "Nguyễn Văn A",
      "avatar": "/uploads/avatars/user-2-1234567890.jpeg"
    }
  }
}
```

### Processing

- **Resize**: 200x200 pixels
- **Format**: JPEG
- **Quality**: 85%
- **Fit**: Cover

### Example (JavaScript)

```javascript
const formData = new FormData();
formData.append("image", fileInput.files[0]);

const response = await fetch("http://localhost:3000/api/upload/avatar", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
console.log("Avatar URL:", result.data.url);
```

---

## 2. Upload Product Image

Upload ảnh cho sản phẩm.

### Endpoint

```
POST /api/upload/product/:productId
```

### Access

- **Admin**: All products
- **Manager**: Only own restaurant's products

### Body (Form Data)

```
image: [File]
```

### Response

```json
{
  "success": true,
  "message": "Product image uploaded successfully",
  "data": {
    "url": "/uploads/products/product-10-1234567890.jpeg",
    "filename": "product-10-1234567890.jpeg",
    "product": {
      "id": 10,
      "name": "Pizza Margherita",
      "image": "/uploads/products/product-10-1234567890.jpeg"
    }
  }
}
```

### Processing

- **Resize**: 800x600 pixels
- **Format**: JPEG
- **Quality**: 80%

---

## 3. Upload Restaurant Image

Upload ảnh cho nhà hàng.

### Endpoint

```
POST /api/upload/restaurant/:restaurantId
```

### Access

- **Admin only**

### Body (Form Data)

```
image: [File]
```

### Response

```json
{
  "success": true,
  "message": "Restaurant image uploaded successfully",
  "data": {
    "url": "/uploads/restaurants/restaurant-1-1234567890.jpeg",
    "filename": "restaurant-1-1234567890.jpeg",
    "restaurant": {
      "id": 1,
      "name": "Phở Hà Nội",
      "image": "/uploads/restaurants/restaurant-1-1234567890.jpeg"
    }
  }
}
```

### Processing

- **Resize**: 1200x800 pixels
- **Format**: JPEG
- **Quality**: 85%

---

## 4. Upload Category Image

Upload ảnh cho category.

### Endpoint

```
POST /api/upload/category/:categoryId
```

### Access

- **Admin only**

### Body (Form Data)

```
image: [File]
```

### Response

```json
{
  "success": true,
  "message": "Category image uploaded successfully",
  "data": {
    "url": "/uploads/categories/category-1-1234567890.jpeg",
    "filename": "category-1-1234567890.jpeg",
    "category": {
      "id": 1,
      "name": "Cơm",
      "image": "/uploads/categories/category-1-1234567890.jpeg"
    }
  }
}
```

### Processing

- **Resize**: 400x300 pixels
- **Format**: JPEG
- **Quality**: 80%

---

## 5. Delete File

Xóa file đã upload.

### Endpoint

```
DELETE /api/upload/file?url=/uploads/avatars/file.jpg
```

### Access

- **Admin only**

### Query Parameters

```
url: string (required) - File URL to delete
```

### Response

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## 6. Get File Info

Lấy thông tin file.

### Endpoint

```
GET /api/upload/file/info?url=/uploads/avatars/file.jpg
```

### Access

- **Protected** (any authenticated user)

### Query Parameters

```
url: string (required) - File URL
```

### Response

```json
{
  "success": true,
  "data": {
    "filename": "user-2-1234567890.jpeg",
    "size": 45678,
    "created": "2024-10-26T10:30:00.000Z",
    "modified": "2024-10-26T10:30:00.000Z",
    "path": "/path/to/file"
  }
}
```

---

## 7. Get Storage Statistics

Xem thống kê storage.

### Endpoint

```
GET /api/upload/stats
```

### Access

- **Admin only**

### Response

```json
{
  "success": true,
  "data": {
    "totalSize": 125829120,
    "totalFiles": 245,
    "totalSizeFormatted": "120.00 MB",
    "byFolder": {
      "avatars": {
        "files": 50,
        "size": 5242880,
        "sizeFormatted": "5.00 MB"
      },
      "products": {
        "files": 120,
        "size": 83886080,
        "sizeFormatted": "80.00 MB"
      },
      "restaurants": {
        "files": 45,
        "size": 31457280,
        "sizeFormatted": "30.00 MB"
      },
      "categories": {
        "files": 20,
        "size": 4194304,
        "sizeFormatted": "4.00 MB"
      },
      "temp": {
        "files": 10,
        "size": 1048576,
        "sizeFormatted": "1.00 MB"
      }
    }
  }
}
```

---

## 8. Cleanup Old Files

Xóa files cũ (older than X days).

### Endpoint

```
POST /api/upload/cleanup
```

### Access

- **Admin only**

### Body

```json
{
  "days": 30
}
```

### Response

```json
{
  "success": true,
  "message": "Deleted 15 old files",
  "data": {
    "deletedCount": 15
  }
}
```

---

## Validation Rules

### File Types

- ✅ `image/jpeg`
- ✅ `image/jpg`
- ✅ `image/png`
- ✅ `image/gif`
- ✅ `image/webp`

### File Size

- **Max**: 5MB per file

### Naming

- Auto-generated: `{type}-{id}-{timestamp}.{ext}`
- Example: `user-2-1698765432.jpeg`

---

## Storage Structure

```
database/uploads/
├── avatars/           # User avatars (200x200)
├── products/          # Product images (800x600)
├── restaurants/       # Restaurant images (1200x800)
├── categories/        # Category images (400x300)
└── temp/              # Temporary uploads
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "No file uploaded"
}
```

### 400 Invalid File Type

```json
{
  "success": false,
  "message": "Invalid file type. Allowed: image/jpeg, image/jpg, image/png, image/gif, image/webp"
}
```

### 400 File Too Large

```json
{
  "success": false,
  "message": "File too large. Max size: 5MB"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Not authorized to update this product"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Example: Complete Upload Flow

### 1. Upload Avatar (React)

```jsx
import React, {useState} from "react";

function AvatarUpload({token}) {
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large (max 5MB)");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("http://localhost:3000/api/upload/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setAvatar(result.data.url);
        alert("Avatar uploaded successfully!");
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (error) {
      alert("Upload error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
      {avatar && (
        <img
          src={`http://localhost:3000${avatar}`}
          alt="Avatar"
          style={{width: 200, height: 200, borderRadius: "50%"}}
        />
      )}
    </div>
  );
}
```

### 2. Upload Product Image (Axios)

```javascript
import axios from "axios";

async function uploadProductImage(productId, file, token) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post(`http://localhost:3000/api/upload/product/${productId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log("Upload progress:", percentCompleted + "%");
      },
    });

    return response.data;
  } catch (error) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw error;
  }
}
```

---

## Tips & Best Practices

### 1. Client-Side Validation

```javascript
function validateImage(file) {
  // Check type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return "Invalid file type";
  }

  // Check size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return "File too large (max 5MB)";
  }

  // Check dimensions (optional)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < 200 || img.height < 200) {
        resolve("Image too small (min 200x200)");
      }
      resolve(null);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

### 2. Preview Before Upload

```javascript
function previewImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Usage
const preview = await previewImage(file);
imageElement.src = preview;
```

### 3. Compress Before Upload

```javascript
async function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => resolve(new File([blob], file.name, {type: "image/jpeg"})), "image/jpeg", quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```

---

## Troubleshooting

### Issue: "Sharp not installed"

```bash
# Install sharp
npm install sharp

# Restart server
npm run dev
```

### Issue: "File not found"

- Check if uploads folder exists: `database/uploads/`
- Check file permissions
- Verify URL path

### Issue: "Upload fails silently"

- Check multer middleware is applied
- Verify content-type is `multipart/form-data`
- Check server logs for errors

### Issue: "CORS error"

- Ensure CORS is enabled in server.js
- Check `Access-Control-Allow-Origin` header

---

## Security Considerations

1. ✅ **File type validation** (whitelist approach)
2. ✅ **File size limits** (5MB max)
3. ✅ **Authentication required** (JWT)
4. ✅ **Authorization checks** (role-based)
5. ✅ **Sanitized filenames** (prevent path traversal)
6. ✅ **Separate storage folders** (organized by type)
7. ⚠️ **TODO**: Virus scanning
8. ⚠️ **TODO**: Rate limiting per user
9. ⚠️ **TODO**: Image watermarking

---

**Made with ❤️ for FunFood API** | Version 2.2.0
