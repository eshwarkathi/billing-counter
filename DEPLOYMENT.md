# Deployment Guide - Billing Counter App

## Deploy to Render.com (Recommended - Free Tier Available)

### Step 1: Create a GitHub Repository

**Why GitHub?** GitHub is a cloud-based platform that hosts Git repositories. It's essential for deployment because platforms like Render.com, Heroku, and Railway connect directly to GitHub repositories to automatically deploy your code.

#### Detailed Steps:

1. **Sign up/Login to GitHub**
   - Go to https://github.com
   - If you don't have an account, click "Sign up" and create one
   - Use a professional email address
   - Choose a username (this will be part of your repository URL)

2. **Create New Repository**
   - Click the "+" icon in the top-right corner
   - Select "New repository" from the dropdown
   - **Repository name**: `billing-counter` (or any name you prefer)
     - Use lowercase, hyphens instead of spaces
     - Make it descriptive but not too long

3. **Repository Settings**
   - **Description**: "A web-based billing and transaction management system" (optional but recommended)
   - **Visibility**: Choose "Public" (free) or "Private" (paid)
     - Public repositories are visible to everyone
     - Private repositories require a paid plan
   - **Initialize with**: Leave all unchecked (we'll add our own files)

4. **Create Repository**
   - Click the green "Create repository" button
   - You'll be taken to your new repository page

5. **Get Repository URL**
   - Copy the repository URL from the address bar or the "Code" button
   - It will look like: `https://github.com/YOUR_USERNAME/billing-counter.git`

#### Alternative: Using GitHub Desktop (GUI Method)

If you prefer a graphical interface:

1. Download and install [GitHub Desktop](https://desktop.github.com)
2. Sign in with your GitHub account
3. Click "File" → "New repository"
4. Fill in the details as above
5. Click "Create repository"

#### Next Steps After Creating Repository

Once your repository is created, you'll need to:
- Clone it to your local machine
- Copy your project files into the cloned directory
- Add, commit, and push your files to GitHub

**Important Notes:**
- Your repository URL will be unique: `https://github.com/YOUR_USERNAME/billing-counter`
- Keep this URL handy - you'll need it for deployment
- The repository must contain all your project files for deployment to work
- GitHub provides free private repositories for students and educators

**Troubleshooting:**
- If you get "Repository name already exists", choose a different name
- Make sure you're logged in before creating a repository
- Check your internet connection if the page doesn't load

### Step 2: Deploy on Render.com

1. Go to https://render.com and sign up
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `billing-counter` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if needed)

5. Click "Create Web Service"
6. Wait for deployment (2-3 minutes)
7. Your app will be available at: `https://billing-counter-xxxx.onrender.com`

### Step 3: Make Your Database Persistent (Important!)

By default, the JSON database gets reset when Render restarts. To fix this:

1. On Render dashboard, go to your service
2. Click "Environment" → "Disks"
3. Create a Persistent Disk:
   - **Mount Path**: `/app/data`
   - **Size**: 1 GB (free tier)

4. Update the `server.js` file:
   ```javascript
   const DB_PATH = process.env.NODE_ENV === 'production'
     ? '/app/data/db.json'
     : path.join(__dirname, 'db.json');
   ```

5. Push changes to GitHub - auto-deployment will trigger

### Alternative: Deploy to Heroku

1. Sign up at https://www.heroku.com
2. Install Heroku CLI
3. Run:
   ```bash
   heroku login
   heroku create billing-counter
   git push heroku main
   heroku open
   ```

### Alternative: Deploy to Railway.app

1. Go to https://railway.app
2. Connect GitHub and select your repository
3. Railway auto-detects Node.js apps
4. Deployment starts automatically

### Verify Deployment

1. Open your deployed URL in a browser
2. Test the "Add Customer and Transaction" feature
3. Check if data persists after page refresh
4. Open browser DevTools (F12) → Network tab to confirm API calls are working

### Troubleshooting

**Issue**: API calls failing with CORS error
- Make sure `express.static()` is serving the HTML files
- The frontend should make calls to the same origin (no hardcoding localhost)

**Issue**: Database not persisting
- Ensure you created a Persistent Disk on Render
- Check the mount path is `/app/data`
- Verify `DB_PATH` in server.js matches

**Issue**: 404 errors on page reload
- Add this to `server.js` for client-side routing:
  ```javascript
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  ```

## Local Development

To run locally during development:
```bash
npm install
npm run dev
```
Access at: http://localhost:3000

## Production Environment Variables

Create a `.env` file (not pushed to GitHub):
```
PORT=3000
NODE_ENV=production
```

## Features Included

✅ Customer management (name, mobile, area, referred by)
✅ Transaction tracking (deposits, withdrawals)
✅ Payment method tracking (online, offline)
✅ Dashboard with analytics
✅ Billing details view
✅ Separate cash-in and cash-out pages
✅ Complete customer details in transactions
✅ Delete functionality
✅ Persistent JSON database

## Next Steps After Deployment

1. **Add Authentication**: Secure the app with login (e.g., simple password or Google OAuth)
2. **Upgrade Database**: Migrate from JSON to MongoDB for better scalability
3. **Add More Features**: 
   - Date range filtering
   - CSV export
   - Customer search
   - Transaction history charts
   - Mobile app version

---

**Your app is now live on the internet!** 🚀
