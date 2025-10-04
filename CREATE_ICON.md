# Quick Icon Creation Guide

## Option 1: Use Lucide React Icons (Already in your project!)

You can convert one of your existing Lucide icons to PNG:

1. Visit: https://lucide.dev/icons/fuel
2. Select the "Fuel" icon (or "Gauge", "Activity")
3. Copy SVG code
4. Go to: https://svgtopng.com/
5. Paste SVG, set size to 1024x1024
6. Download PNG

## Option 2: Use this SVG template

Save this as logo.svg, then convert to PNG:

```svg
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="transparent"/>
  <g transform="translate(212, 212)">
    <path d="M384 0H192C86 0 0 86 0 192v384c0 106 86 192 192 192h192c106 0 192-86 192-192V192c0-106-86-192-192-192zm96 576c0 53-43 96-96 96H192c-53 0-96-43-96-96V192c0-53 43-96 96-96h192c53 0 96 43 96 96v384z" fill="#1e40af"/>
    <path d="M432 256h64c18 0 32 14 32 32v64c0 18-14 32-32 32h-64v64h64c53 0 96-43 96-96v-64c0-53-43-96-96-96h-64c-18 0-32 14-32 32s14 32 32 32z" fill="#1e40af"/>
    <circle cx="288" cy="384" r="32" fill="#1e40af"/>
  </g>
</svg>
```

## Option 3: Quick Photopea (Free Photoshop alternative)

1. Go to: https://www.photopea.com/
2. Create new: 1024x1024, transparent background
3. Use text tool: Type "FT" (Fuel Tracker)
4. Use shape tools: Draw fuel pump shape
5. Color: #1e40af
6. Export as PNG
