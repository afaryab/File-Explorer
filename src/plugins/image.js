const express = require('express');
const path = require('path');
const fs = require('fs');
const fileTypes = require('../config/fileTypes');

const router = express.Router();

const imageExtensions = fileTypes.image;

// Get image metadata
router.get('/api/image/info/*', (req, res) => {
  try {
    const filename = req.params['0'] || '';
    const basePath = path.join(__dirname, '../../data');
    const fullPath = path.join(basePath, filename);
    
    if (!fullPath.startsWith(basePath)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const stats = fs.statSync(fullPath);
    const ext = path.extname(filename).toLowerCase();
    
    if (!imageExtensions.includes(ext)) {
      return res.status(400).json({ error: 'Not an image file' });
    }
    
    res.json({
      name: path.basename(filename),
      size: stats.size,
      modified: stats.mtime,
      extension: ext,
      isImage: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  name: 'image-viewer',
  routes: router,
  description: 'Image viewer plugin',
  supportedExtensions: imageExtensions
};
