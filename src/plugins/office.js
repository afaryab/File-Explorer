const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const officeExtensions = {
  word: ['.doc', '.docx'],
  excel: ['.xls', '.xlsx', '.csv'],
  powerpoint: ['.ppt', '.pptx']
};

// Get office document info
router.get('/api/office/info/*', (req, res) => {
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
    
    let docType = null;
    if (officeExtensions.word.includes(ext)) docType = 'word';
    else if (officeExtensions.excel.includes(ext)) docType = 'excel';
    else if (officeExtensions.powerpoint.includes(ext)) docType = 'powerpoint';
    
    if (!docType) {
      return res.status(400).json({ error: 'Not an Office document' });
    }
    
    res.json({
      name: path.basename(filename),
      size: stats.size,
      modified: stats.mtime,
      extension: ext,
      type: docType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  name: 'office-viewer',
  routes: router,
  description: 'Office documents (Word, Excel, PowerPoint) viewer/editor plugin',
  supportedExtensions: [...officeExtensions.word, ...officeExtensions.excel, ...officeExtensions.powerpoint]
};
