const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Your Neon database connection string
const connectionString = process.env.DATABASE_URL || 'your-neon-connection-string';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function uploadImage(imagePath, userId, imageName) {
  try {
    // Read the image file as binary data
    const imageBuffer = fs.readFileSync(imagePath);
    const imageType = path.extname(imagePath).slice(1); // Get extension without dot
    const imageSize = imageBuffer.length;

    // Insert into database
    const query = `
      INSERT INTO meal_images (user_id, image_data, image_name, image_type, image_size)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, image_name, image_size, uploaded_at;
    `;

    const values = [
      userId,
      imageBuffer,
      imageName,
      `image/${imageType}`,
      imageSize
    ];

    const result = await pool.query(query, values);
    console.log('Image uploaded successfully:', result.rows[0]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Example usage:
const imagePath = path.join(__dirname, '../assets/images/ai_test_1_meal_image.jpg');
const userId = 1; // Replace with actual user ID
const imageName = 'ai_test_1_meal_image.jpg';

uploadImage(imagePath, userId, imageName)
  .then(() => console.log('Done!'))
  .catch(err => console.error('Failed:', err));
