#!/bin/bash
echo "🔧 Custom build script for Next.js with API routes"
echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building Next.js application..."
npx next build

echo "✅ Build completed"
