import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return Response.json({ error: 'clerkId is required' }, { status: 400 });
    }

    const userStatus = await sql`
      SELECT measurements_filled FROM users WHERE clerk_id = ${clerkId}
    `;

    if (userStatus.length === 0) {
      // This can happen briefly after sign-up before the user record is created.
      // Treat as not filled.
      return Response.json({ measurements_filled: false });
    }

    return Response.json({ measurements_filled: userStatus[0].measurements_filled });
  } catch (error) {
    console.error('Error fetching user status:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
