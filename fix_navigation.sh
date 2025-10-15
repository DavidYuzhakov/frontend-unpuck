#!/bin/bash

# Список файлов для исправления
files=(
  "src/app/notifications/page.tsx"
  "src/app/affiliate/page.tsx" 
  "src/app/terms/page.tsx"
  "src/app/secure-deal/page.tsx"
  "src/app/profile/social/page.tsx"
  "src/app/profile/verification/page.tsx"
)

for file in "${files[@]}"; do
  echo "Fixing $file"
  
  # Добавляем импорт useRouter если его нет
  if ! grep -q "useRouter" "$file"; then
    sed -i '' '/import { useState } from '\''react'\''/a\
import { useRouter } from '\''next/navigation'\''
' "$file"
  fi
  
  # Добавляем router в компонент если его нет
  if ! grep -q "const router = useRouter()" "$file"; then
    sed -i '' '/export default function/a\
  const router = useRouter()
' "$file"
  fi
  
  # Исправляем кнопку назад
  sed -i '' 's/<button className="p-1 -ml-1">/<button onClick={() => router.back()} className="p-1 -ml-1">/' "$file"
done

echo "Done!"
