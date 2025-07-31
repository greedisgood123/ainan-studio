# Image Carousel Setup

This folder contains the images for your gallery carousel.

## How to Add Images

1. **Place your images** in this folder (`src/assets/imagesCarousel/`)
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Recommended size: 400x400px or higher
   - Name them descriptively (e.g., `headshot-1.jpg`, `portrait-business.png`)

2. **Import images** in `index.ts`:
   ```typescript
   import image1 from './headshot-1.jpg';
   import image2 from './portrait-business.png';
   // Add more imports as needed
   ```

3. **Add to the array** in `index.ts`:
   ```typescript
   const galleryImages: string[] = [
     image1,
     image2,
     // Add your imports here
   ];
   ```

4. **Enable local images** in `Gallery.tsx`:
   - Uncomment the import line at the top:
     ```typescript
     import localImages from "@/assets/imagesCarousel";
     ```
   - Replace the `galleryImages` array with:
     ```typescript
     const galleryImages = localImages;
     ```

## Example Setup

### index.ts
```typescript
import headshot1 from './headshot-1.jpg';
import headshot2 from './headshot-2.jpg';
import headshot3 from './headshot-3.jpg';

const galleryImages: string[] = [
  headshot1,
  headshot2,
  headshot3,
];

export default galleryImages;
```

### Gallery.tsx
```typescript
import localImages from "@/assets/imagesCarousel";

export const Gallery = () => {
  const galleryImages = localImages;
  // ... rest of component
};
```

## Benefits of Local Images

- ✅ Faster loading (bundled with your app)
- ✅ Better performance (optimized by Vite)
- ✅ No external dependencies
- ✅ Works offline
- ✅ TypeScript support 