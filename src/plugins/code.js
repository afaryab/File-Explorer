const express = require('express');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const codeExtensions = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss', 
  '.py', '.java', '.cpp', '.c', '.h', '.go', '.rs', '.php', 
  '.rb', '.sh', '.bash', '.yaml', '.yml', '.xml', '.sql', '.md'
];

// Get code file content
router.get('/api/code/read/*', (req, res) => {
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
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const ext = path.extname(filename).toLowerCase();
    
    res.json({
      content,
      extension: ext,
      name: path.basename(filename)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save code file (requires auth)
router.post('/api/code/save/*', requireAuth, (req, res) => {
  try {
    const filename = req.params['0'] || '';
    const { content } = req.body;
    const basePath = path.join(__dirname, '../../data');
    const fullPath = path.join(basePath, filename);
    
    if (!fullPath.startsWith(basePath)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    
    res.json({ message: 'File saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  name: 'code-editor',
  routes: router,
  description: 'Code editor plugin with syntax highlighting',
  supportedExtensions: codeExtensions
};
