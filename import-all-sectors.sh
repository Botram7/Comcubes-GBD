#!/bin/bash

echo "🚀 Starting sequential sector imports..."
echo ""

for i in {0..12}; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Importing sector $((i + 1))/13"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  npx tsx server/utils/importSingleSector.ts $i
  
  if [ $? -ne 0 ]; then
    echo "❌ Failed to import sector $((i + 1))"
    exit 1
  fi
  
  echo ""
  sleep 1
done

echo "✅ All sectors imported successfully!"
echo ""
