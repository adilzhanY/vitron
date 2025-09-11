import { isNeonDbError } from '@/lib/utils';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const {
      name,
      email,
      clerkId,
    } = await request.json();
    if (!name || !email || !clerkId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    const response = await sql`
      INSERT INTO users (
        name,
        email,
        clerk_id
      )
      VALUES (
        ${name},
        ${email},
        ${clerkId}
      )
      RETURNING id
      `;
    return new Response(JSON.stringify({ data: response }), { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/user", error);

    if (isNeonDbError(error) && error.code === '23505') {
      return Response.json(
        { error: "User with this email or Clerk ID already exists", details: error.detail },
        { status: 409 } // 409 Conflict
      );
    }

    return Response.json(
      { error: "An internal server error occurred", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const {
      clerkId,
      weight,
      height,
      weightGoal,
      dailyCalorieGoal,
      goal
    } = await request.json();

    if (!clerkId) {
      return Response.json(
        { error: "Missing clerkId" },
        { status: 400 }
      );
    }

    const response = await sql`
      UPDATE users
      SET
        weight = ${weight},
        height = ${height},
        weight_goal = ${weightGoal},
        daily_calorie_goal = ${dailyCalorieGoal},
        goal = ${goal},
        measurements_filled = TRUE
      WHERE clerk_id = ${clerkId}
      RETURNING id
    `;

    if (response.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return new Response(JSON.stringify({ data: response }), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/user:", error);
    return Response.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}
