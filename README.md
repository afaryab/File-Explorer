# File Explorer - Windows 11 Style

A modern Node.js File Explorer application with a Windows 11-inspired UI and extensible plugin architecture.

## Features

- 🎨 **Windows 11 Style UI** - Beautiful, modern interface designed with Tailwind CSS
- 🔌 **Plugin Architecture** - Easily extend functionality with custom plugins
- 🔐 **Authentication System** - Secure user login and registration
- 🖼️ **Image Viewer** - View images in various formats (JPG, PNG, GIF, SVG, etc.)
- 📝 **Code Editor** - Edit code files with syntax highlighting
- 📕 **PDF Viewer** - View PDF documents directly in the browser
- 📘 **Office Document Viewer** - View Word, Excel, and PowerPoint files
- 🔍 **Search** - Quickly find files and folders
- 📂 **Navigation** - Intuitive folder navigation with breadcrumbs

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/afaryab/File-Explorer.git
cd File-Explorer
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Docker Deployment

### Build and Run with Docker

```bash
docker build -t file-explorer .
docker run -p 3000:3000 -v $(pwd)/data:/usr/src/app/data file-explorer
```

### Using Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  file-explorer:
    image: file-explorer:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/usr/src/app/data
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secret-key
```

Run:
```bash
docker-compose up -d
```

## CI/CD Pipeline

The repository includes a GitHub Actions workflow that automatically:
- Builds a Docker image on every push to the `main` branch
- Pushes the image to Docker Hub
- Uses build caching for faster builds

### Setting up CI/CD

1. Create secrets in your GitHub repository:
   - `DOCKER_USERNAME` - Your Docker Hub username
   - `DOCKER_PASSWORD` - Your Docker Hub password or access token

2. The workflow will automatically trigger on push to `main` branch

## Plugin System

The application supports custom plugins for extending functionality. Each plugin can:
- Register custom routes
- Handle specific file types
- Add new features

### Available Plugins

1. **Auth Plugin** (`src/plugins/auth.js`)
   - User registration and login
   - JWT-based authentication
   - Session management

2. **Image Viewer** (`src/plugins/image.js`)
   - Supports: JPG, PNG, GIF, WebP, SVG, BMP, ICO
   - Displays images in a modal viewer

3. **Code Editor** (`src/plugins/code.js`)
   - Supports: JS, TS, HTML, CSS, Python, Java, C++, and more
   - View and edit code files
   - Requires authentication to save changes

4. **PDF Viewer** (`src/plugins/pdf.js`)
   - View PDF documents in browser

5. **Office Viewer** (`src/plugins/office.js`)
   - View Word, Excel, PowerPoint documents
   - Utilizes Microsoft Office Online viewer

### Creating a Custom Plugin

Create a new file in `src/plugins/`:

```javascript
const express = require('express');
const router = express.Router();

// Define your routes
router.get('/api/myplugin/endpoint', (req, res) => {
  res.json({ message: 'Hello from my plugin!' });
});

module.exports = {
  name: 'my-plugin',
  routes: router,
  description: 'My custom plugin',
  supportedExtensions: ['.ext']
};
```

## Project Structure

```
File-Explorer/
├── .github/
│   └── workflows/
│       └── docker-deploy.yml    # CI/CD pipeline
├── data/                        # File storage (mounted volume)
├── public/                      # Static files
│   ├── css/
│   │   ├── input.css           # Tailwind input
│   │   └── styles.css          # Generated styles
│   ├── js/
│   │   └── app.js              # Frontend JavaScript
│   └── index.html              # Main UI
├── src/
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   └── plugins/                # Plugin directory
│       ├── auth.js
│       ├── code.js
│       ├── image.js
│       ├── office.js
│       └── pdf.js
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── package.json
├── postcss.config.js
├── server.js                    # Main server file
└── tailwind.config.js
```

## Configuration

Environment variables (`.env`):

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

## Security

- All file paths are validated to prevent directory traversal attacks
- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- HTTPS should be used in production

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS
- **Authentication**: JWT, bcryptjs
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Author

Built with ❤️ for modern file management