#!/bin/bash

# PWA Icon Generator Script
# Generates all required icon sizes from a single base icon

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          PWA Icon Generator for Fuel Tracker Pro             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found!"
    echo ""
    echo "📦 Install ImageMagick first:"
    echo "   macOS:  brew install imagemagick"
    echo "   Ubuntu: sudo apt install imagemagick"
    echo "   Windows: Download from https://imagemagick.org/script/download.php"
    echo ""
    exit 1
fi

echo "✅ ImageMagick found!"
echo ""

# Create icons directory
mkdir -p public/icons

# Check if base icon exists
if [ ! -f "base-icon.png" ]; then
    echo "🎨 No base-icon.png found. Creating minimalist pastel icon..."
    echo ""
    
    # Create minimalist pastel icon
    # Base: Soft pastel purple gradient background
    convert -size 512x512 \
      -define gradient:angle=135 \
      gradient:'#E9D5FF-#DDD6FE' \
      -fill '#E9D5FF' \
      -draw "roundrectangle 0,0 512,512 100,100" \
      base-temp.png
    
    # Add soft circular background for icon
    convert base-temp.png \
      -fill '#F3E8FF' \
      -draw "circle 256,256 256,150" \
      base-temp2.png
    
    # Add minimalist receipt icon (simple lines)
    # Receipt outline
    convert base-temp2.png \
      -fill none \
      -stroke '#C084FC' \
      -strokewidth 8 \
      -draw "roundrectangle 180,140 332,372 15,15" \
      base-temp3.png
    
    # Add minimalist lines inside receipt
    convert base-temp3.png \
      -fill '#C084FC' \
      -draw "rectangle 210,200 302,206" \
      -draw "rectangle 210,240 302,246" \
      -draw "rectangle 210,280 260,286" \
      base-temp4.png
    
    # Add simple fuel drop icon at bottom (minimalist)
    convert base-temp4.png \
      -fill '#A78BFA' \
      -draw "ellipse 256,330 25,35 0,360" \
      -draw "path 'M 256,295 L 240,315 L 272,315 Z'" \
      base-icon.png
    
    # Clean up temp files
    rm -f base-temp*.png
    
    echo "✅ Created base-icon.png (minimalist pastel style)"
    echo "   💡 Tip: Replace base-icon.png with your own design and run this script again"
    echo ""
fi

# Generate all required sizes
echo "📦 Generating icon sizes..."
echo ""

sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
    echo "   → Generating ${size}×${size}..."
    convert base-icon.png \
      -resize ${size}x${size} \
      -quality 95 \
      public/icons/icon-${size}x${size}.png
done

echo ""
echo "✅ All icons generated successfully!"
echo ""
echo "📁 Generated files:"
ls -lh public/icons/ | grep icon
echo ""
echo "🎯 Next steps:"
echo "   1. Check icons: open public/icons/"
echo "   2. Build app: npm run build"
echo "   3. Test PWA: npm run preview"
echo "   4. Deploy: git add public/icons/ && git commit -m 'Add PWA icons'"
echo ""
echo "💡 To customize:"
echo "   1. Create your own 512×512 PNG icon"
echo "   2. Save it as 'base-icon.png' in project root"
echo "   3. Run this script again: ./generate-icons.sh"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Icons ready! 🎉                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"

