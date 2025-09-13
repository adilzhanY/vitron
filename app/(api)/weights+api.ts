import { isNeonDbError } from '@/lib/utils';
import { neon } from '@neondatabase/serverless';

// GET all weight entries for a user
export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return Response.json({ error: "clerkId is required" }, { status: 400 });
    }

    // First, get the internal user ID from the clerkId
    const userResult = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult[0].id;

    // Then, fetch all weight entries for that user
    const weights = await sql`
      SELECT weight, logged_at
      FROM weights
      WHERE user_id = ${userId}
      ORDER BY logged_at DESC
    `;

    return Response.json({ data: weights }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/weights:", error);
    return Response.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}

// POST a new weight entry
export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, weight } = await request.json();

    if (!clerkId || !weight) {
      return Response.json({ error: "Missing required fields: clerkId, weight" }, { status: 400 });
    }

    // Get the internal user ID from the clerkId
    const userResult = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult[0].id;

    // Insert the new weight entry, updating if one already exists for today
    const response = await sql`
      INSERT INTO weights (user_id, weight)
      VALUES (${userId}, ${weight})
      ON CONFLICT (user_id, logged_date) DO UPDATE
      SET weight = EXCLUDED.weight,
        logged_at = NOW()
      RETURNING id, weight, logged_at
    `;

    return new Response(JSON.stringify({ data: response[0] }), { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/weights:", error);
    return Response.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}