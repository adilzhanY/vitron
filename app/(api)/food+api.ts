import { isNeonDbError } from '@/lib/utils';
import { neon } from '@neondatabase/serverless';

// GET food entries for a specific day
export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const {searchParams} = new URL(request.url);
    const clerkId = searchParams.get("clerkId");
    const date = searchParams.get('date');

    if(!clerkId) {
      return Response.json({error: 'clerkId is required'}, {status: 400});
    }

    // First, get the internal user ID from the clerkId
    const userResult = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if(userResult.length === 0) {
      return Response.json({error: "User not found"}, {status: 404})
    };
    const userId = userResult[0].id;

    // Fetch food entry for a specific date
    const foods = await sql`
      SELECT name, is_saved, calories, protein, carbs, fat, meal_type, logged_at
      FROM meals
      WHERE user_id = ${userId} AND DATE(logged_at) = ${date}
    `;

    return Response.json({data: foods}, {status: 200});

  } catch (error) {
    console.error("Error in GET /api/food:", error);
    return Response.json({error: "An internal server error occurred"}, {status: 500});
  }
}

// POST a new food entry
export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, name, calories, protein, carbs, fat, mealType, isSaved} = await request.json();

    if(!clerkId || calories == null) {
      return Response.json({error: "Missing required fields: clerkId, calories"}, {status: 400});
    }

    // Get the internal user ID from the clerkId
    const userResult = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if(userResult.length === 0) {
      return Response.json({error: "User not found"}, {status: 404});

    }
    const userId = userResult[0].id;

    // Insert the new food entry
    const response = await sql`
      INSERT INTO meals (
        user_id,
        name,
        calories, 
        protein, 
        carbs, 
        fat, 
        meal_type,
        is_saved
      )
      VALUES (
        ${userId},
        ${name},
        ${calories},
        ${protein},
        ${carbs},
        ${fat},
        ${mealType},
        ${isSaved}
      )
      RETURNING *
    `;
    return new Response(JSON.stringify({data: response[0]}), {status: 200});
  } catch (error) {
    console.error("Error in POST /api/food:", error);
    return Response.json({error: "An internal server error occurred"}, {status: 500});
  }
}
