# PWA Icons

This directory should contain the following icon sizes for your PWA:

## Required Icons

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

## How to Generate Icons

### Option 1: Using Online Tools

1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   - Upload your base image (1024x1024 recommended)
   - Download the generated icon pack
   - Extract into this directory

2. **Favicon Generator**: https://realfavicongenerator.net/
   - Upload your logo
   - Configure settings
   - Download and extract

### Option 2: Using Command Line

Install `sharp-cli`:
```bash
npm install -g sharp-cli
```

Generate icons from a base image:
```bash
sharp -i logo.png -o icon-72x72.png resize 72 72
sharp -i logo.png -o icon-96x96.png resize 96 96
sharp -i logo.png -o icon-128x128.png resize 128 128
sharp -i logo.png -o icon-144x144.png resize 144 144
sharp -i logo.png -o icon-152x152.png resize 152 152
sharp -i logo.png -o icon-192x192.png resize 192 192
sharp -i logo.png -o icon-384x384.png resize 384 384
sharp -i logo.png -o icon-512x512.png resize 512 512
```

### Option 3: Quick Placeholder

For testing, you can use a solid color or simple design:
- Create a 512x512 PNG with your app's primary color
- Add text "FT" (Fuel Tracker) in white
- Use online tools to resize to all required dimensions

## Recommended Design

- Simple, recognizable icon (fuel pump, motorcycle, or gauge)
- High contrast for visibility
- Square format with rounded corners
- Primary brand color background
- Works well at small sizes (72x72)

## Notes

- All icons should be PNG format
- Use transparent background or solid brand color
- Ensure icons look good on both light and dark backgrounds
- Test icons on various devices and home screen backgrounds

