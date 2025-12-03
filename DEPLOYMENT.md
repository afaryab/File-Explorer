# Deployment Guide

## Prerequisites

- Docker installed (for containerized deployment)
- Node.js 18+ (for local development)
- GitHub account (for CI/CD)
- Docker Hub account (for image hosting)

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/afaryab/File-Explorer.git
   cd File-Explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and set JWT_SECRET
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   ```
   Open http://localhost:3000 in your browser
   ```

## Docker Deployment

### Build and Run Locally

```bash
# Build the image
docker build -t file-explorer .

# Run the container
docker run -d \
  --name file-explorer \
  -p 3000:3000 \
  -v $(pwd)/data:/usr/src/app/data \
  -e JWT_SECRET=your-production-secret-here \
  file-explorer

# View logs
docker logs -f file-explorer
```

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  file-explorer:
    image: file-explorer:latest
    container_name: file-explorer
    ports:
      - "3000:3000"
    volumes:
      - ./data:/usr/src/app/data
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
```

Run:
```bash
JWT_SECRET=your-secret docker-compose up -d
```

## CI/CD Setup (GitHub Actions)

1. **Configure GitHub Secrets**
   
   Go to your repository → Settings → Secrets and variables → Actions
   
   Add the following secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or access token

2. **Workflow Trigger**
   
   The workflow automatically triggers on push to the `main` branch.

3. **Image Tags**
   
   The workflow creates the following tags:
   - `main` - Latest from main branch
   - `main-<sha>` - Specific commit SHA
   - `latest` - Latest stable release

4. **Pull the Image**
   ```bash
   docker pull <your-dockerhub-username>/file-explorer:latest
   ```

## Production Deployment

### Security Checklist

- [ ] Set a strong `JWT_SECRET` (32+ random characters)
- [ ] Use HTTPS/TLS (configure reverse proxy)
- [ ] Replace JSON file storage with a proper database
- [ ] Set up proper logging and monitoring
- [ ] Configure firewall rules
- [ ] Enable CORS properly for your domain
- [ ] Add additional authentication measures (2FA, email verification)
- [ ] Set up regular backups of the data volume

### Recommended Production Setup

```bash
# 1. Pull the latest image
docker pull <username>/file-explorer:latest

# 2. Create a strong secret
JWT_SECRET=$(openssl rand -base64 32)

# 3. Run with production settings
docker run -d \
  --name file-explorer \
  --restart always \
  -p 3000:3000 \
  -v /var/file-explorer/data:/usr/src/app/data \
  -e NODE_ENV=production \
  -e JWT_SECRET="$JWT_SECRET" \
  <username>/file-explorer:latest

# 4. Set up nginx reverse proxy (optional but recommended)
# See nginx.conf.example for configuration
```

### Using with Nginx Reverse Proxy

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `JWT_SECRET` | Yes* | N/A | JWT signing secret (*required in production) |

## Health Checks

Check if the application is running:

```bash
curl http://localhost:3000/api/auth/status
```

Expected response:
```json
{"authenticated":false}
```

## Troubleshooting

### Application won't start

1. Check Docker logs: `docker logs file-explorer`
2. Verify environment variables are set
3. Ensure port 3000 is not already in use
4. Check file permissions on data volume

### JWT_SECRET error in production

Make sure you've set the `JWT_SECRET` environment variable:
```bash
docker run -e JWT_SECRET=your-secret-here ...
```

### Cannot access from outside localhost

1. Ensure Docker port mapping: `-p 3000:3000`
2. Check firewall rules
3. Verify nginx reverse proxy configuration

### Rate limiting issues

Rate limits are configured in `src/middleware/rateLimiter.js`:
- API: 100 req/15min
- Auth: 5 req/15min
- Files: 200 req/15min

Adjust if needed for your use case.

## Monitoring

### View Logs
```bash
# Docker logs
docker logs -f file-explorer

# Last 100 lines
docker logs --tail 100 file-explorer
```

### Container Stats
```bash
docker stats file-explorer
```

## Backup

### Backup Data Volume
```bash
docker run --rm \
  -v /var/file-explorer/data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/file-explorer-backup-$(date +%Y%m%d).tar.gz /data
```

### Restore Data Volume
```bash
docker run --rm \
  -v /var/file-explorer/data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/file-explorer-backup-YYYYMMDD.tar.gz -C /
```

## Scaling

For production deployments with multiple instances:

1. Use a load balancer (nginx, HAProxy)
2. Implement distributed rate limiting (Redis)
3. Use a shared file system or object storage (S3, MinIO)
4. Migrate user storage to a database (PostgreSQL, MongoDB)

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/afaryab/File-Explorer/issues
- Documentation: See README.md

