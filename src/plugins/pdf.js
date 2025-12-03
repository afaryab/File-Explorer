const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get PDF file info
router.get('/api/pdf/info/*', (req, res) => {
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
    
    if (ext !== '.pdf') {
      return res.status(400).json({ error: 'Not a PDF file' });
    }
    
    res.json({
      name: path.basename(filename),
      size: stats.size,
      modified: stats.mtime,
      extension: ext
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  name: 'pdf-viewer',
  routes: router,
  description: 'PDF viewer plugin',
  supportedExtensions: ['.pdf']
};
