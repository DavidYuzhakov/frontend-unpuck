const https = require('https');
const fs = require('fs');
const path = require('path');

// Создаем папки если их нет
const createDirectories = () => {
  const dirs = [
    'public/images/products',
    'public/images/avatars', 
    'public/images/placeholders'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Создана папка: ${dir}`);
    }
  });
};

// Функция для скачивания изображения
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Скачано: ${path.basename(filepath)}`);
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Удаляем файл при ошибке
      reject(err);
    });
  });
};

// Основная функция
const main = async () => {
  console.log('🚀 Начинаем скачивание изображений...');
  
  createDirectories();
  
  // Список изображений для скачивания
  const images = [
    // Аватары по умолчанию
    {
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      filename: 'default-avatar-1.jpg',
      category: 'avatars'
    },
    {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      filename: 'default-avatar-2.jpg',
      category: 'avatars'
    },
    {
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      filename: 'default-avatar-3.jpg',
      category: 'avatars'
    },
    {
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      filename: 'default-avatar-4.jpg',
      category: 'avatars'
    },
    {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      filename: 'default-avatar-5.jpg',
      category: 'avatars'
    },
    
    // Изображения товаров
    {
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      filename: 'product-watch-1.jpg',
      category: 'products'
    },
    {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      filename: 'product-headphones-1.jpg',
      category: 'products'
    },
    {
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      filename: 'product-shoes-1.jpg',
      category: 'products'
    },
    {
      url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop',
      filename: 'product-phone-1.jpg',
      category: 'products'
    },
    {
      url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
      filename: 'product-glasses-1.jpg',
      category: 'products'
    },
    {
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      filename: 'product-laptop-1.jpg',
      category: 'products'
    },
    {
      url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
      filename: 'product-camera-1.jpg',
      category: 'products'
    },
    {
      url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
      filename: 'product-bag-1.jpg',
      category: 'products'
    },
    {
      url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
      filename: 'product-perfume-1.jpg',
      category: 'products'
    },
    {
      url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
      filename: 'product-jewelry-1.jpg',
      category: 'products'
    },
    
    // Placeholder изображения
    {
      url: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=400&fit=crop',
      filename: 'placeholder-1.jpg',
      category: 'placeholders'
    },
    {
      url: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=400&fit=crop',
      filename: 'placeholder-2.jpg',
      category: 'placeholders'
    },
    {
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      filename: 'placeholder-3.jpg',
      category: 'placeholders'
    }
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  console.log(`📥 Скачиваем ${images.length} изображений...`);
  
  for (const image of images) {
    try {
      const filepath = path.join('public/images', image.category, image.filename);
      await downloadImage(image.url, filepath);
      successCount++;
    } catch (error) {
      console.error(`❌ Ошибка скачивания ${image.filename}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n🎉 Скачивание завершено!`);
  console.log(`✅ Успешно: ${successCount}`);
  console.log(`❌ Ошибок: ${errorCount}`);
  
  // Создаем файл с информацией о скачанных изображениях
  const imageInfo = {
    downloadedAt: new Date().toISOString(),
    totalImages: images.length,
    successCount,
    errorCount,
    images: images.map(img => ({
      filename: img.filename,
      category: img.category,
      originalUrl: img.url
    }))
  };
  
  fs.writeFileSync(
    'public/images/images-info.json', 
    JSON.stringify(imageInfo, null, 2)
  );
  
  console.log('📄 Создан файл images-info.json с информацией о изображениях');
};

// Запускаем скрипт
main().catch(console.error);


















