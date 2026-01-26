# 🚀 Deployment Guide - Secure Data Portal

## Overview
This guide covers deploying your full-stack application:
- **Backend**: FastAPI (Python) → Render/Railway
- **Frontend**: React + Vite → Vercel/Netlify
- **Database**: MongoDB Atlas (already deployed ✅)

---

## 📋 Pre-Deployment Checklist

### 1. Update CORS Settings
Before deploying, update `backend/main.py` to allow your frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-frontend-domain.vercel.app",  # Add your deployed frontend URL
        "https://your-frontend-domain.netlify.app"   # Or Netlify URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Create `.env` File (DO NOT COMMIT)
Ensure `backend/.env` has:
```
MONGODB_URI=mongodb+srv://rajuchaswik:Raju2006@cluster0.4baxit3.mongodb.net/computersecurity?retryWrites=true&w=majority
DB_NAME=computersecurity
SECRET_KEY=9f2a1c8b4d7e6a3f5c8d1b0e9a7f6c4e
PEPPER=7c3b9a2e4d6f8a1c5e9b0d2f4a6c8e1
```

---

## 🎯 Option 1: Deploy to Render (Recommended - Free Tier)

### Backend Deployment

1. **Create GitHub Repository** (if not already done):
   ```bash
   cd C:\computersecurity
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/secure-data-portal.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and sign up
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `secure-data-portal-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Instance Type**: `Free`
   
3. **Add Environment Variables** (in Render dashboard):
   - `MONGODB_URI` = `mongodb+srv://rajuchaswik:Raju2006@cluster0.4baxit3.mongodb.net/computersecurity?retryWrites=true&w=majority`
   - `DB_NAME` = `computersecurity`
   - `SECRET_KEY` = `9f2a1c8b4d7e6a3f5c8d1b0e9a7f6c4e`
   - `PEPPER` = `7c3b9a2e4d6f8a1c5e9b0d2f4a6c8e1`

4. **Deploy** and copy your backend URL (e.g., `https://secure-data-portal-backend.onrender.com`)

### Frontend Deployment

1. **Update API Base URL** in `frontend/src/services/api.js`:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://secure-data-portal-backend.onrender.com';
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up
   - Click **"Add New"** → **"Project"**
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: `Vite`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   
3. **Add Environment Variable**:
   - `VITE_API_URL` = `https://secure-data-portal-backend.onrender.com`

4. **Deploy** and get your frontend URL (e.g., `https://secure-data-portal.vercel.app`)

5. **Update CORS** in `backend/main.py`:
   - Add your Vercel URL to `allow_origins`
   - Redeploy backend on Render

---

## 🎯 Option 2: Deploy to Railway (Alternative)

### Backend Deployment

1. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app) and sign up
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Select your repository
   - Railway auto-detects Python and deploys
   
2. **Add Environment Variables** (in Railway dashboard):
   - Same as Render (MONGODB_URI, DB_NAME, SECRET_KEY, PEPPER)

3. **Generate Domain**:
   - Click **"Settings"** → **"Generate Domain"**
   - Copy your backend URL

### Frontend: Same as Option 1 (Vercel)

---

## 🎯 Option 3: Netlify (Frontend Alternative)

1. **Deploy on Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign up
   - Drag and drop `frontend` folder OR connect GitHub
   - Configure:
     - **Build Command**: `npm run build`
     - **Publish Directory**: `dist`
   
2. **Add Environment Variable**:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com`

---

## ⚙️ Post-Deployment Configuration

### 1. Update CORS in Backend
Edit `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://secure-data-portal.vercel.app",  # Your actual frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Test All Features
- ✅ User Registration
- ✅ Two-Factor Authentication
- ✅ File Upload (with encryption)
- ✅ File Download (with decryption)
- ✅ File Delete (Admin only)
- ✅ Access Control (Admin/Manager/Recipient)
- ✅ File Expiry
- ✅ Theory Documentation endpoints

### 3. MongoDB Atlas Network Access
- Go to MongoDB Atlas dashboard
- **Network Access** → **Add IP Address**
- Click **"Allow Access from Anywhere"** (for Render/Railway)
- Or add specific IPs from your hosting provider

---

## 📊 Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| MongoDB Atlas | Free (M0) | $0/month |
| Render Backend | Free | $0/month (sleeps after 15 min inactivity) |
| Vercel Frontend | Hobby | $0/month |
| **TOTAL** | | **$0/month** |

**Note**: Free tiers have limitations:
- Render: Backend sleeps after 15 minutes of inactivity (first request takes ~30s to wake up)
- MongoDB Atlas: 512 MB storage, suitable for labs/projects
- Vercel: 100 GB bandwidth/month

---

## 🔧 Troubleshooting

### Backend not starting on Render
- Check **Logs** in Render dashboard
- Ensure all environment variables are set
- Verify `requirements.txt` includes all dependencies

### CORS errors
- Double-check frontend URL in `allow_origins`
- Ensure no trailing slash in URLs
- Redeploy backend after CORS changes

### MongoDB connection errors
- Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
- Check MONGODB_URI environment variable is correct
- Ensure database user has read/write permissions

### Files not persisting after backend restart
- RSA keys are now saved in `backend/storage/` folder
- Render may clear files on restart - consider using persistent storage or S3

---

## 🚀 Quick Deploy Commands

```bash
# 1. Commit all changes
git add .
git commit -m "Prepare for deployment"
git push

# 2. Deploy backend on Render (via dashboard)
# 3. Deploy frontend on Vercel (via dashboard)
# 4. Update CORS and redeploy backend
```

---

## 📝 Important URLs After Deployment

- **Frontend**: https://secure-data-portal.vercel.app
- **Backend**: https://secure-data-portal-backend.onrender.com
- **API Docs**: https://secure-data-portal-backend.onrender.com/docs
- **MongoDB**: cluster0.4baxit3.mongodb.net (already deployed)

---

## 🎓 For Viva Demonstration

1. **Share Frontend URL** with evaluator
2. **Demo User Credentials**:
   - Admin: `Raju` / `Raju@2006`
   - (Create test Manager and Recipient users during demo)
3. **Explain Architecture**:
   - Frontend: React + Vite (Vercel)
   - Backend: FastAPI (Render)
   - Database: MongoDB Atlas
   - Security: AES-256 + RSA-2048 + bcrypt + TOTP

---

## ✅ Deployment Checklist

- [ ] GitHub repository created and pushed
- [ ] Backend deployed on Render/Railway
- [ ] Frontend deployed on Vercel/Netlify
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] MongoDB Atlas network access configured
- [ ] All features tested on production
- [ ] Admin user (Raju) accessible
- [ ] Documentation endpoints working
- [ ] RSA keys persisted

---

**🎉 Your application is now live and ready for viva demonstration!**

For support: Check logs in Render/Vercel dashboards
