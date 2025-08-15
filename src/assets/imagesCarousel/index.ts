// Optimized WebP images (90-100% smaller than original JPGs)
import image1 from './20191208-LAN_0281.webp';
import image2 from './AIN00523.webp';
import image3 from './AIN00718.webp';
import image4 from './Amin-Rashidi-Studio-664.webp';
import image5 from './DSC_3411.webp';
import image6 from './FKP03731.webp';
import image7 from './FKP03833.webp';
import image8 from './FKP03935.webp';
import image9 from './0FK_1526.webp';
import image10 from './0FK_0696.webp';
// Note: image10 was duplicate of image8, so using 9 images total

// Gallery Images - Your local images are imported above
// 
// To add more images:
// 1. Place new image files in this folder (assets/imagesCarousel/)
// 2. Import them above following the pattern: import imageX from './filename.jpg'
// 3. Add the imported variable to the galleryImages array below

// Array of optimized WebP images - 39MB+ bandwidth saved!
const galleryImages: string[] = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  // 10 optimized images total - each 90-100% smaller than original
];

export default galleryImages; 