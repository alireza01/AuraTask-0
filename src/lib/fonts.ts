import { Vazirmatn } from 'next/font/google';

// Load Vazirmatn font with Persian (Arabic) and Latin subsets
export const vazirmatn = Vazirmatn({
    subsets: ['arabic', 'latin'],
    display: 'swap',
    variable: '--font-vazirmatn',
    adjustFontFallback: false, // Disable automatic font fallback adjustment
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], // Include all available weights
});