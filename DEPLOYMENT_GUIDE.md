# 🚀 Deployment Guide

Complete guide for deploying the Multiplayer Tic Tac Toe game to various hosting platforms.

## 📋 Prerequisites

- Git repository with the project
- Node.js 14+ (for full-stack deployment)
- Basic understanding of web hosting

## 🎯 Deployment Options

### Option 1: Static Hosting (Single Player Only)
Deploy only the `/public/` folder for single-player functionality.

### Option 2: Full-Stack Hosting (Multiplayer Enabled)
Deploy the complete project with Node.js server for multiplayer features.

---

## 🌐 Static Hosting Platforms

### GitHub Pages

#### Setup Steps:
1. **Navigate to repository settings**
2. **Go to Pages section**
3. **Select source branch**: `multiplayer-websocket`
4. **Set folder**: `/public` (if available) or root
5. **Save and wait for deployment**

#### Custom Domain (Optional):
```
# Add CNAME file in public/ folder
echo "yourdomain.com" > public/CNAME
```

#### Access:
```
https://yourusername.github.io/Tic-Tac-Toe-by-Deepankar/
```

### Netlify

#### Method 1: Git Integration
1. **Connect GitHub repository**
2. **Set build settings**:
   - Build command: `npm run build` (if needed)
   - Publish directory: `public`
3. **Deploy**

#### Method 2: Drag & Drop
1. **Zip the `/public/` folder**
2. **Drag to Netlify dashboard**
3. **Instant deployment**

#### Custom Domain:
- Add domain in Netlify dashboard
- Configure DNS settings

### Vercel

#### Deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod

# Set public directory as output
```

#### Configuration (`vercel.json`):
```json
{
  "builds": [
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

---

## 🖥️ Full-Stack Hosting Platforms

### Heroku

#### Setup:
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-tictactoe-app

# Set Node.js buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku multiplayer-websocket:main
```

#### Configuration:
- **Procfile**: `web: node server.js`
- **Environment**: Heroku automatically sets PORT
- **WebSocket**: Supported natively

#### Custom Domain:
```bash
heroku domains:add yourdomain.com
```

### Railway

#### Deployment:
1. **Connect GitHub repository**
2. **Select branch**: `multiplayer-websocket`
3. **Auto-deploy on push**
4. **Environment variables**: None needed

#### Configuration:
- **Start command**: `node server.js`
- **Port**: Automatically configured
- **WebSocket**: Fully supported

### Render

#### Setup:
1. **Connect GitHub repository**
2. **Create Web Service**
3. **Configuration**:
   - Build command: `npm install`
   - Start command: `node server.js`
   - Branch: `multiplayer-websocket`

#### Environment:
- **Node version**: 14+
- **Auto-deploy**: On git push
- **HTTPS**: Automatic SSL

### DigitalOcean App Platform

#### Configuration (`app.yaml`):
```yaml
name: tictactoe-multiplayer
services:
- name: web
  source_dir: /
  github:
    repo: yourusername/Tic-Tac-Toe-by-Deepankar
    branch: multiplayer-websocket
  run_command: node server.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

### AWS (EC2 + Elastic Beanstalk)

#### Elastic Beanstalk:
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

#### Configuration:
- **Platform**: Node.js
- **Application version**: Upload zip
- **Environment variables**: None required

---

## 🔧 Environment Configuration

### Environment Variables

#### For Production:
```bash
# Port (usually auto-set by hosting platform)
PORT=3000

# Node Environment
NODE_ENV=production
```

#### Platform-Specific:

**Heroku:**
```bash
heroku config:set NODE_ENV=production
```

**Railway/Render:**
- Set in dashboard environment variables

### Package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'",
    "test": "echo 'No tests specified'"
  }
}
```

---

## 🌍 Domain & SSL Configuration

### Custom Domain Setup

#### DNS Configuration:
```
# For static hosting
CNAME: www.yourdomain.com -> platform-url

# For full-stack hosting
A Record: yourdomain.com -> server-ip
CNAME: www.yourdomain.com -> yourdomain.com
```

#### SSL Certificates:
- **Automatic**: Most platforms provide free SSL
- **Custom**: Upload your own certificates if needed

---

## 📊 Performance Optimization

### Static Assets:
- **Minify CSS/JS**: Use build tools if needed
- **Compress images**: Optimize any future image assets
- **CDN**: Use platform CDN features

### Server Optimization:
```javascript
// Add to server.js for production
if (process.env.NODE_ENV === 'production') {
  // Enable compression
  const compression = require('compression');
  app.use(compression());
  
  // Set cache headers
  app.use(express.static('public', {
    maxAge: '1d'
  }));
}
```

---

## 🔍 Monitoring & Analytics

### Platform Monitoring:
- **Heroku**: Built-in metrics
- **Railway**: Dashboard analytics
- **Render**: Performance insights

### Custom Analytics:
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

---

## 🐛 Troubleshooting

### Common Issues:

#### WebSocket Connection Failed:
- **Check HTTPS**: Use WSS for HTTPS sites
- **Port configuration**: Ensure correct port binding
- **Firewall**: Check hosting platform firewall rules

#### Static Files Not Loading:
- **Path issues**: Verify `/public/` directory structure
- **MIME types**: Ensure server serves correct content types
- **Case sensitivity**: Check file name casing

#### Build Failures:
- **Node version**: Ensure compatible Node.js version
- **Dependencies**: Check package.json for missing deps
- **Memory limits**: Increase build memory if needed

### Debug Commands:
```bash
# Check logs
heroku logs --tail  # Heroku
railway logs        # Railway

# Test locally
npm start
curl http://localhost:3000
```

---

## ✅ Deployment Checklist

### Pre-Deployment:
- [ ] Test locally with `npm start`
- [ ] Verify all files in correct directories
- [ ] Check package.json scripts
- [ ] Test WebSocket connections
- [ ] Validate HTML/CSS/JS

### Post-Deployment:
- [ ] Test single-player functionality
- [ ] Test multiplayer features
- [ ] Verify responsive design
- [ ] Check browser console for errors
- [ ] Test on multiple devices

### Production Ready:
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics tracking (optional)
- [ ] Performance monitoring
- [ ] Error tracking setup

---

## 🎉 Success!

Your Multiplayer Tic Tac Toe game is now live and ready for players worldwide!

### Share Your Game:
- **URL**: Your deployed game URL
- **QR Code**: Generate for easy mobile access
- **Social Media**: Share with friends and community

### Next Steps:
- Monitor usage and performance
- Gather user feedback
- Plan future enhancements
- Scale as needed

Happy gaming! 🎮✨