# Video Solutions for Cloudflare Pages

## 🎬 Problem Solved!

The deployment was failing because `hero-optimized.mp4` was 29.4MB, but Cloudflare Pages has a **25MB file size limit**.

## ✅ What We Fixed:

1. **Removed the large video file** (`public/hero-optimized.mp4`)
2. **Created `HeroVideo` component** with multiple hosting options
3. **Updated `Hero` component** to use the new video component
4. **Added video optimization script** for future use

## 🎯 Video Hosting Options:

### Option 1: YouTube (Recommended) 🎥
**Best for Cloudflare Pages - No file size limits!**

1. Upload your video to YouTube
2. Get the video ID from the URL: `https://www.youtube.com/watch?v=**VIDEO_ID**`
3. Add to your environment variables:
   ```env
   VITE_HERO_YOUTUBE_ID=your_video_id_here
   ```

**Benefits:**
- ✅ No file size limits
- ✅ Automatic optimization
- ✅ Global CDN
- ✅ Free hosting
- ✅ Automatic loop support

### Option 2: Vimeo 🎬
**Professional video hosting**

1. Upload your video to Vimeo
2. Get the video ID from the URL: `https://vimeo.com/**VIDEO_ID**`
3. Add to your environment variables:
   ```env
   VITE_HERO_VIMEO_ID=your_video_id_here
   ```

**Benefits:**
- ✅ No file size limits
- ✅ Professional quality
- ✅ Privacy controls
- ✅ Analytics

### Option 3: Optimized Local Video 📹
**If you want to keep it local**

1. Use the optimization script:
   ```bash
   node scripts/optimize-video.js
   ```
2. This will create `hero-cloudflare.mp4` under 25MB
3. The component will automatically use it

### Option 4: External Video URL 🌐
**Host anywhere and link to it**

1. Upload your video to any hosting service (AWS S3, Cloudflare R2, etc.)
2. Add the URL to your environment variables:
   ```env
   VITE_HERO_VIDEO_URL=https://your-video-url.com/video.mp4
   ```

## 🚀 Quick Setup:

### For YouTube (Recommended):
1. Upload your hero video to YouTube
2. Copy the video ID from the URL
3. Add to Cloudflare Pages environment variables:
   ```
   VITE_HERO_YOUTUBE_ID=your_video_id
   VITE_API_BASE_URL=https://ainan-studio-backend.ainanstudio.workers.dev
   ```

### For Vimeo:
1. Upload your hero video to Vimeo
2. Copy the video ID from the URL
3. Add to Cloudflare Pages environment variables:
   ```
   VITE_HERO_VIMEO_ID=your_video_id
   VITE_API_BASE_URL=https://ainan-studio-backend.ainanstudio.workers.dev
   ```

## 🎨 Video Requirements:

For the best hero video experience:
- **Duration**: 10-30 seconds (will loop infinitely)
- **Resolution**: 1920x1080 or higher
- **Format**: MP4 (H.264) or WebM
- **Aspect Ratio**: 16:9 (landscape)
- **Content**: Slow, cinematic shots of photography/studio work

## 🔧 Environment Variables:

Add these to your Cloudflare Pages environment variables:

```env
# API Configuration
VITE_API_BASE_URL=https://ainan-studio-backend.ainanstudio.workers.dev

# Video Configuration (choose one)
VITE_HERO_YOUTUBE_ID=your_youtube_video_id
# OR
VITE_HERO_VIMEO_ID=your_vimeo_video_id
# OR
VITE_HERO_VIDEO_URL=https://your-video-url.com/video.mp4
```

## 🎯 Expected Result:

Your hero section will now display:
- ✅ **YouTube/Vimeo video** (if configured)
- ✅ **Local optimized video** (if under 25MB)
- ✅ **Fallback image** (if no video is configured)
- ✅ **Infinite loop** playback
- ✅ **Autoplay with mute** (required by browsers)

## 🚀 Deploy Now!

The deployment should now work perfectly! Try deploying to Cloudflare Pages again. 🎉
