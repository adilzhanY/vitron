import { neon } from "@neondatabase/serverless";

// GET water intake for a specific day
export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerkId");
    const date = searchParams.get("date");

    if (!clerkId) {
      return Response.json({ error: "clerkId is required" }, { status: 400 });
    }

    if (!date) {
      return Response.json({ error: "date is required" }, { status: 400 });
    }

    // First, get the internal user ID from the clerkId
    const userResult =
      await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult[0].id;

    // Fetch water intake for a specific date
    const waterIntake = await sql`
      SELECT 
        id,
        total_consumed, 
        daily_goal,
        date
      FROM daily_water_intake
      WHERE user_id = ${userId} AND date = ${date}::date
      LIMIT 1;
    `;

    // If no record exists, return default values
    if (waterIntake.length === 0) {
      return Response.json(
        { data: { total_consumed: 0, daily_goal: 2500 } },
        { status: 200 },
      );
    }

    return Response.json({ data: waterIntake[0] }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/water:", error);
    return Response.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

// POST a new water intake entry (first time for the day)
export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, date, amount = 250, dailyGoal = 2500 } = await request.json();

    if (!clerkId) {
      return Response.json(
        { error: "Missing required field: clerkId" },
        { status: 400 },
      );
    }

    // Get the internal user ID from the clerkId
    const userResult =
      await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult[0].id;

    const entryDate = date || new Date().toISOString().split("T")[0];

    // Insert the new water intake entry with initial amount
    const response = await sql`
      INSERT INTO daily_water_intake (
        user_id,
        date,
        total_consumed,
        daily_goal
      )
      VALUES (
        ${userId},
        ${entryDate}::date,
        ${amount},
        ${dailyGoal}
      )
      RETURNING *
    `;

    return Response.json({ data: response[0] }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/water:", error);
    return Response.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

// PATCH to update water intake (increment by amount)
export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, date, amount = 250 } = await request.json();

    if (!clerkId) {
      return Response.json(
        { error: "Missing required field: clerkId" },
        { status: 400 },
      );
    }

    // Get the internal user ID from the clerkId
    const userResult =
      await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult[0].id;

    const entryDate = date || new Date().toISOString().split("T")[0];

    // Increment the water intake by the specified amount
    const response = await sql`
      UPDATE daily_water_intake
      SET 
        total_consumed = total_consumed + ${amount},
        updated_at = NOW()
      WHERE user_id = ${userId} AND date = ${entryDate}::date
      RETURNING *
    `;

    if (response.length === 0) {
      return Response.json(
        { error: "Water intake record not found for this date" },
        { status: 404 },
      );
    }

    return Response.json({ data: response[0] }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/water:", error);
    return Response.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
