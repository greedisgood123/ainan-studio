import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const inputVideo = 'public/hero-optimized.mp4';
const outputVideo = 'public/hero-cloudflare.mp4';

console.log('🎬 Optimizing hero video for Cloudflare Pages...');

if (!existsSync(inputVideo)) {
  console.error('❌ Input video not found:', inputVideo);
  process.exit(1);
}

try {
  // Use ffmpeg to compress the video
  const command = `ffmpeg -i "${inputVideo}" -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k -movflags +faststart -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" "${outputVideo}"`;
  
  console.log('🔄 Compressing video...');
  execSync(command, { stdio: 'inherit' });
  
  console.log('✅ Video optimized successfully!');
  console.log('📁 Output file:', outputVideo);
  
} catch (error) {
  console.error('❌ Error optimizing video:', error.message);
  console.log('\n💡 Alternative solutions:');
  console.log('1. Install ffmpeg: https://ffmpeg.org/download.html');
  console.log('2. Use online video compressor');
  console.log('3. Use external video hosting (YouTube, Vimeo, etc.)');
}
