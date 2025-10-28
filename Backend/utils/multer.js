import multer from "multer";
import path from "path";
import fs from "fs";

// Ensures uploads directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Get original extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    
    console.log("💾 Multer saving file:");
    console.log("   - Original:", file.originalname);
    console.log("   - Saved as:", filename);
    console.log("   - Extension:", ext);
    
    cb(null, filename);
  }
});

// File filter to accept only videos and images
const fileFilter = (req, file, cb) => {
  console.log("🔍 Multer file filter:");
  console.log("   - Field name:", file.fieldname);
  console.log("   - Original name:", file.originalname);
  console.log("   - MIME type:", file.mimetype);
  
  // Accept videos for lecture files
  if (file.fieldname === 'file' && file.mimetype.startsWith('video/')) {
    cb(null, true);
  }
  // Accept images for course thumbnails
  else if (file.fieldname === 'courseThumbnail' && file.mimetype.startsWith('image/')) {
    cb(null, true);
  }
  else {
    console.error("File type rejected:", file.mimetype);
    cb(new Error(`Invalid file type: ${file.mimetype}. Expected video for lectures or image for thumbnails.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

export default upload;