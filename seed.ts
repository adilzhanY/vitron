import { neon } from "@neondatabase/serverless";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Define the structure of an exercise based on the JSON file
interface Exercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("Error: DATABASE_URL environment variable is not set.");
    console.log(
      "Please create a .env file and add your Neon database connection string.",
    );
    process.exit(1);
  }

  const sql = neon(dbUrl);

  try {
    console.log("--- Starting database seed process ---");

    // --- 1. Read and Parse JSON Data ---
    console.log("Reading exercises.json data...");
    const filePath = path.join(__dirname, "data", "exercises.json");
    const jsonData = await fs.readFile(filePath, "utf-8");
    const exercises: Exercise[] = JSON.parse(jsonData);
    console.log(`Successfully read ${exercises.length} exercises.`);

    console.log('Table "exercises" is ready.');

    // --- 3. Clear existing data to prevent duplicates on re-seeding ---
    console.log('Clearing existing data from "exercises" table...');
    await sql`DELETE FROM exercises;`;
    console.log("Existing data cleared.");

    // --- 4. Insert New Data ---
    console.log("Inserting new exercise data...");
    let insertedCount = 0;
    for (const exercise of exercises) {
      await sql`
        INSERT INTO exercises (
          exercise_id, 
          name, 
          gif_url, 
          target_muscles, 
          body_parts, 
          equipments, 
          secondary_muscles, 
          instructions
        ) VALUES (
          ${exercise.exerciseId}, 
          ${exercise.name}, 
          ${exercise.gifUrl}, 
          ${JSON.stringify(exercise.targetMuscles)}, 
          ${JSON.stringify(exercise.bodyParts)}, 
          ${JSON.stringify(exercise.equipments)}, 
          ${JSON.stringify(exercise.secondaryMuscles)}, 
          ${JSON.stringify(exercise.instructions)}
        ) ON CONFLICT (exercise_id) DO NOTHING;
      `;
      insertedCount++;
      // Optional: Log progress
      if (insertedCount % 100 === 0) {
        console.log(
          `Inserted ${insertedCount} of ${exercises.length} exercises...`,
        );
      }
    }
    console.log(`Successfully inserted ${insertedCount} exercises.`);
    console.log("--- Database seed process finished successfully! ---");
  } catch (error) {
    console.error("An error occurred during the seed process:", error);
    process.exit(1);
  }
}

main();
