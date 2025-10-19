const fs = require('fs');
const path = require('path');

function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64String = imageBuffer.toString('base64');
    
    console.log('Base64 string (first 100 chars):');
    console.log(base64String.substring(0, 100) + '...');
    console.log('\nFull length:', base64String.length);
    console.log('\nSQL Insert Statement:');
    console.log(`
INSERT INTO meal_images (user_id, image_data, image_name, image_type, image_size)
VALUES (
  1, -- Replace with your user_id
  decode('${base64String}', 'base64'),
  '${path.basename(imagePath)}',
  'image/${path.extname(imagePath).slice(1)}',
  ${imageBuffer.length}
);
    `);
    
    return base64String;
  } catch (error) {
    console.error('Error reading image:', error);
    throw error;
  }
}

// Example usage:
const imagePath = process.argv[2] || path.join(__dirname, '../assets/images/ai_test_1_meal_image.jpg');
imageToBase64(imagePath);
