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
      gender,
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
        gender = ${gender},
        initial_weight = ${weight},
        height = ${height},
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

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return new Response(JSON.stringify({ error: "clerkId is required" }), { status: 400 });
    }

    // Fetch user data and their latest weight goal in one go
    const userQuery = await sql`
            SELECT
                u.id,
                u.name,
                u.email,
                u.clerk_id,
                u.initial_weight,
                u.height,
                u.measurements_filled,
                u.goal,
                wg.start_weight,
                wg.checkpoints
            FROM users u
            LEFT JOIN (
                SELECT
                    user_id,
                    start_weight,
                    checkpoints,
                    ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY created_at DESC) as rn
                FROM weight_goals
            ) wg ON u.id = wg.user_id AND wg.rn = 1
            WHERE u.clerk_id = ${clerkId}
        `;

    if (userQuery.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ data: userQuery[0] }), { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/user:", error);
    return new Response(JSON.stringify({ error: "An internal server error occurred" }), { status: 500 });
  }
}

