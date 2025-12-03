const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { apiLimiter, fileLimiter } = require('./src/middleware/rateLimiter');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Plugin system
const plugins = new Map();

function loadPlugins() {
  const pluginDir = path.join(__dirname, 'src', 'plugins');
  const pluginFiles = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));
  
  pluginFiles.forEach(file => {
    const plugin = require(path.join(pluginDir, file));
    if (plugin.name && plugin.routes) {
      plugins.set(plugin.name, plugin);
      console.log(`Loaded plugin: ${plugin.name}`);
      
      // Register plugin routes
      if (plugin.routes) {
        app.use(plugin.routes);
      }
    }
  });
}

// File system routes
app.get('/api/config/file-types', (req, res) => {
  const fileTypes = require('./src/config/fileTypes');
  res.json(fileTypes);
});

app.get('/api/files', fileLimiter, require('./src/middleware/auth').optionalAuth, (req, res) => {
  const requestedPath = req.query.path || '/';
  const basePath = path.join(__dirname, 'data');
  const fullPath = path.join(basePath, requestedPath);
  
  // Security check: prevent path traversal
  if (!fullPath.startsWith(basePath)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    const files = items.map(item => {
      const itemPath = path.join(fullPath, item.name);
      const stats = fs.statSync(itemPath);
      
      return {
        name: item.name,
        type: item.isDirectory() ? 'folder' : 'file',
        size: item.isFile() ? stats.size : null,
        modified: stats.mtime,
        extension: item.isFile() ? path.extname(item.name).toLowerCase() : null
      };
    });
    
    res.json({ 
      path: requestedPath,
      files: files.sort((a, b) => {
        // Folders first, then files
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/file/*', fileLimiter, require('./src/middleware/auth').optionalAuth, (req, res) => {
  const filename = req.params['0'] || '';
  const basePath = path.join(__dirname, 'data');
  const fullPath = path.join(basePath, filename);
  
  // Security check
  if (!fullPath.startsWith(basePath)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.sendFile(fullPath);
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Load plugins
loadPlugins();

// Start server
app.listen(PORT, () => {
  console.log(`File Explorer server running on http://localhost:${PORT}`);
  console.log(`Loaded ${plugins.size} plugins`);
});
