// State management
let currentPath = '/';
let currentUser = null;
let selectedFile = null;
let navigationHistory = ['/'];
let historyIndex = 0;
let fileTypes = null;

// File type icons
const fileIcons = {
  folder: '📁',
  image: '🖼️',
  code: '📝',
  pdf: '📕',
  word: '📘',
  excel: '📗',
  powerpoint: '📙',
  default: '📄'
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load file types configuration from server
  try {
    const response = await fetch('/api/config/file-types');
    fileTypes = await response.json();
  } catch (error) {
    console.error('Failed to load file types config:', error);
  }
  
  checkAuthStatus();
  loadFiles('/');
});

// Auth functions
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    if (data.authenticated) {
      currentUser = data.username;
      updateUserInfo();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
  }
}

function updateUserInfo() {
  const userInfo = document.getElementById('userInfo');
  if (currentUser) {
    userInfo.innerHTML = `
      <span>👤 ${currentUser}</span>
      <button class="btn btn-secondary" onclick="logout()">Logout</button>
    `;
  } else {
    userInfo.innerHTML = `
      <button class="btn btn-primary" onclick="showAuthModal()">Login</button>
    `;
  }
}

function showAuthModal() {
  document.getElementById('authModal').classList.add('active');
  document.getElementById('authUsername').value = '';
  document.getElementById('authPassword').value = '';
  document.getElementById('authMessage').textContent = '';
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('active');
}

async function login() {
  const username = document.getElementById('authUsername').value;
  const password = document.getElementById('authPassword').value;
  const messageEl = document.getElementById('authMessage');
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      currentUser = data.username;
      updateUserInfo();
      closeAuthModal();
      messageEl.textContent = '';
    } else {
      messageEl.textContent = data.error || 'Login failed';
      messageEl.style.color = 'red';
    }
  } catch (error) {
    messageEl.textContent = 'Login failed: ' + error.message;
    messageEl.style.color = 'red';
  }
}

async function register() {
  const username = document.getElementById('authUsername').value;
  const password = document.getElementById('authPassword').value;
  const messageEl = document.getElementById('authMessage');
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      messageEl.textContent = 'Registration successful! Please login.';
      messageEl.style.color = 'green';
    } else {
      messageEl.textContent = data.error || 'Registration failed';
      messageEl.style.color = 'red';
    }
  } catch (error) {
    messageEl.textContent = 'Registration failed: ' + error.message;
    messageEl.style.color = 'red';
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    currentUser = null;
    updateUserInfo();
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// Navigation
function navigateTo(path) {
  if (historyIndex < navigationHistory.length - 1) {
    navigationHistory = navigationHistory.slice(0, historyIndex + 1);
  }
  navigationHistory.push(path);
  historyIndex = navigationHistory.length - 1;
  
  currentPath = path;
  loadFiles(path);
}

function navigateBack() {
  if (historyIndex > 0) {
    historyIndex--;
    currentPath = navigationHistory[historyIndex];
    loadFiles(currentPath);
  }
}

function navigateForward() {
  if (historyIndex < navigationHistory.length - 1) {
    historyIndex++;
    currentPath = navigationHistory[historyIndex];
    loadFiles(currentPath);
  }
}

function navigateUp() {
  const parts = currentPath.split('/').filter(p => p);
  parts.pop();
  const newPath = '/' + parts.join('/');
  navigateTo(newPath);
}

function refreshFiles() {
  loadFiles(currentPath);
}

// File loading
async function loadFiles(path) {
  const filesGrid = document.getElementById('filesGrid');
  const addressBar = document.getElementById('addressBar');
  
  filesGrid.innerHTML = '<div class="loading active">Loading files...</div>';
  
  try {
    const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
    const data = await response.json();
    
    addressBar.value = data.path || path;
    updateBreadcrumb(data.path || path);
    
    filesGrid.innerHTML = '';
    
    if (data.files.length === 0) {
      filesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 32px; color: #666;">This folder is empty</div>';
    } else {
      data.files.forEach(file => {
        const fileEl = createFileElement(file);
        filesGrid.appendChild(fileEl);
      });
    }
  } catch (error) {
    filesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 32px; color: red;">Error loading files: ' + error.message + '</div>';
  }
}

function updateBreadcrumb(path) {
  const breadcrumb = document.getElementById('breadcrumb');
  const parts = path.split('/').filter(p => p);
  
  let html = '<span class="breadcrumb-item" onclick="navigateTo(\'/\')">Home</span>';
  
  let currentPath = '';
  parts.forEach(part => {
    currentPath += '/' + part;
    html += '<span> › </span>';
    html += `<span class="breadcrumb-item" onclick="navigateTo('${currentPath}')">${part}</span>`;
  });
  
  breadcrumb.innerHTML = html;
}

function createFileElement(file) {
  const div = document.createElement('div');
  div.className = 'file-item';
  
  const icon = getFileIcon(file);
  
  div.innerHTML = `
    <div class="file-icon-large">${icon}</div>
    <div class="file-name">${file.name}</div>
  `;
  
  div.onclick = () => {
    if (file.type === 'folder') {
      const newPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      navigateTo(newPath);
    } else {
      openFile(file);
    }
  };
  
  return div;
}

function getFileIcon(file) {
  if (file.type === 'folder') return fileIcons.folder;
  
  const ext = file.extension;
  if (!ext || !fileTypes) return fileIcons.default;
  
  // Image files
  if (fileTypes.image.includes(ext)) {
    return fileIcons.image;
  }
  
  // Code files
  if (fileTypes.code.includes(ext)) {
    return fileIcons.code;
  }
  
  // PDF
  if (fileTypes.pdf.includes(ext)) return fileIcons.pdf;
  
  // Office documents
  if (fileTypes.word.includes(ext)) return fileIcons.word;
  if (fileTypes.excel.includes(ext)) return fileIcons.excel;
  if (fileTypes.powerpoint.includes(ext)) return fileIcons.powerpoint;
  
  return fileIcons.default;
}

// File viewing
async function openFile(file) {
  if (!fileTypes) {
    alert('File types configuration not loaded yet');
    return;
  }
  
  selectedFile = file;
  const modal = document.getElementById('fileModal');
  const title = document.getElementById('fileModalTitle');
  const body = document.getElementById('fileModalBody');
  const saveButton = document.getElementById('saveButton');
  
  title.textContent = file.name;
  saveButton.style.display = 'none';
  
  const ext = file.extension;
  const filePath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
  
  // Image viewer
  if (fileTypes.image.includes(ext)) {
    body.innerHTML = `
      <div class="image-viewer">
        <img src="/api/file/${filePath.substring(1)}" alt="${file.name}">
      </div>
    `;
    modal.classList.add('active');
  }
  // Code editor
  else if (fileTypes.code.includes(ext)) {
    try {
      const response = await fetch(`/api/code/read/${filePath.substring(1)}`);
      const data = await response.json();
      
      body.innerHTML = `<textarea id="codeEditor">${data.content}</textarea>`;
      
      if (currentUser) {
        saveButton.style.display = 'block';
      }
      
      modal.classList.add('active');
    } catch (error) {
      alert('Failed to load file: ' + error.message);
    }
  }
  // PDF viewer
  else if (fileTypes.pdf.includes(ext)) {
    body.innerHTML = `
      <div class="pdf-viewer">
        <iframe src="/api/file/${filePath.substring(1)}"></iframe>
      </div>
    `;
    modal.classList.add('active');
  }
  // Office documents
  else if ([...fileTypes.word, ...fileTypes.excel, ...fileTypes.powerpoint].includes(ext)) {
    body.innerHTML = `
      <div class="office-viewer">
        <iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + '/api/file/' + filePath.substring(1))}"></iframe>
      </div>
    `;
    modal.classList.add('active');
  }
  // Default download
  else {
    window.location.href = `/api/file/${filePath.substring(1)}`;
  }
}

function closeFileModal() {
  document.getElementById('fileModal').classList.remove('active');
  selectedFile = null;
}

async function saveFile() {
  if (!selectedFile || !currentUser) return;
  
  const content = document.getElementById('codeEditor').value;
  const filePath = currentPath === '/' ? `/${selectedFile.name}` : `${currentPath}/${selectedFile.name}`;
  
  try {
    const response = await fetch(`/api/code/save/${filePath.substring(1)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    
    if (response.ok) {
      alert('File saved successfully!');
    } else {
      const data = await response.json();
      alert('Failed to save: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    alert('Failed to save: ' + error.message);
  }
}

// Search functionality
document.getElementById('searchBox').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const fileItems = document.querySelectorAll('.file-item');
  
  fileItems.forEach(item => {
    const name = item.querySelector('.file-name').textContent.toLowerCase();
    if (name.includes(query)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
});
