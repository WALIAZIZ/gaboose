# 🚀 Gaboose Hotel - Vercel Deployment Guide

## Step 1: Push Code to GitHub

1. Create a new GitHub repository (private recommended)
2. Upload this entire folder to the repository
3. Or use the GitHub CLI:
   ```
   git init
   git add .
   git commit -m "Initial commit - Gaboose Hotel"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/gaboose-hotel.git
   git push -u origin main
   ```

## Step 2: Create Vercel Account & Import Project

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npx prisma generate && next build`
   - **Install Command**: `npm install`
   - **Output Directory**: Leave default

## Step 3: Set Up Vercel Postgres (Database)

1. Go to Vercel Dashboard > your project > **Storage** tab
2. Click **Create Database** > select **Postgres (Neon)**
3. Choose the **Free** Hobby plan
4. After creation, go to **Settings** > copy the connection string
5. In Vercel project > **Settings** > **Environment Variables**, add:
   - Name: `DATABASE_URL`
   - Value: Paste the connection string from step 4
   - Select All environments (Production, Preview, Development)

## Step 4: Set Up Vercel Blob (File Storage)

1. Go to Vercel Dashboard > your project > **Storage** tab
2. Click **Create Store** > select **Blob**
3. Choose the **Free** plan
4. After creation, copy the **BLOB_READ_WRITE_TOKEN**
5. In Vercel project > **Settings** > **Environment Variables**, add:
   - Name: `BLOB_READ_WRITE_TOKEN`
   - Value: Paste the token
   - Select All environments

## Step 5: Add JWT Secret

1. In Vercel project > **Settings** > **Environment Variables**, add:
   - Name: `JWT_SECRET`
   - Value: Generate a secure string at https://generate-secret.vercel.app/32
   - Select All environments

## Step 6: Set Up Database & Seed Data

After your first deployment succeeds:

### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run database migrations
npx prisma db push

# Seed the database
npx prisma db seed
```

### Option B: Using Neon Console
1. Go to [neon.tech](https://neon.tech) and find your database
2. Go to **SQL Editor** tab
3. Run `npx prisma db push` locally with the DATABASE_URL from Vercel

## Step 7: Redeploy

1. Go to Vercel Dashboard > your project > **Deployments**
2. Click **Redeploy** on the latest deployment
3. Your site should now be live with seed data!

## 🔑 Default Admin Credentials

After seeding:
- **Admin**: username `admin` / password `admin123`
- **Employee**: username `employee` / password `employee123`

⚠️ **IMPORTANT**: Change these passwords immediately after first login via Admin > Settings > Change Password

## 📋 Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string from Vercel Postgres |
| `JWT_SECRET` | Yes | Secret key for JWT authentication tokens |
| `BLOB_READ_WRITE_TOKEN` | Yes | Token for Vercel Blob file uploads |

## 🌐 Custom Domain (Optional)

1. Go to Vercel Dashboard > your project > **Settings** > **Domains**
2. Add your custom domain (e.g., `gaboosehotel.com`)
3. Update DNS records at your domain registrar as shown
4. Vercel will auto-configure SSL

## 💰 Estimated Monthly Costs

| Service | Plan | Cost |
|---------|------|------|
| Vercel Hosting | Hobby (Free) | $0 |
| Vercel Postgres | Hobby (Free) | $0 |
| Vercel Blob | Free tier (1GB) | $0 |
| Custom Domain | Your registrar | ~$10/year |
| **Total** | | **~$10/year** |

## ⚠️ Troubleshooting

### Build Error: "prisma generate" fails
- Make sure `DATABASE_URL` is set in Vercel environment variables
- Try running `npx prisma generate` locally first

### Database Connection Error
- Check that `DATABASE_URL` starts with `postgresql://`
- Make sure `?sslmode=require` is in the connection string
- Verify the Neon database is not paused (free plans auto-pause after inactivity)

### File Upload Not Working
- Check that `BLOB_READ_WRITE_TOKEN` is set correctly
- Verify the Blob store is created and not paused

### Admin Dashboard Not Loading
- Make sure you ran `npx prisma db push` and seeded the database
- Try accessing `/admin/login` directly
- Default credentials: admin / admin123
