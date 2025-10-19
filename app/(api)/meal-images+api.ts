import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerkId, imageData, imageName, imageType, mealId } = body;

    if (!clerkId || !imageData) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    // Get user_id from clerk_id
    const userResult = await sql`
      SELECT id FROM users WHERE clerk_id = ${clerkId}
    `;

    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Convert base64 to binary
    const imageBuffer = Buffer.from(imageData, 'base64');

    // Insert image into database
    const result = await sql`
      INSERT INTO meal_images (
        user_id,
        meal_id,
        image_data,
        image_name,
        image_type,
        image_size
      )
      VALUES (
        ${userId},
        ${mealId || null},
        ${imageBuffer},
        ${imageName},
        ${imageType},
        ${imageBuffer.length}
      )
      RETURNING id, image_name, image_size, uploaded_at
    `;

    return Response.json(
      { success: true, data: result[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return Response.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerkId");
    const imageId = searchParams.get("imageId");

    if (!clerkId) {
      return Response.json(
        { error: "Missing clerkId parameter" },
        { status: 400 }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    // Get user_id from clerk_id
    const userResult = await sql`
      SELECT id FROM users WHERE clerk_id = ${clerkId}
    `;

    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Get specific image or all user's images
    let result;
    if (imageId) {
      result = await sql`
        SELECT id, image_data, image_name, image_type, image_size, 
               is_analyzed, ai_response, uploaded_at
        FROM meal_images
        WHERE id = ${imageId} AND user_id = ${userId}
      `;
    } else {
      result = await sql`
        SELECT id, image_name, image_type, image_size, 
               is_analyzed, uploaded_at
        FROM meal_images
        WHERE user_id = ${userId}
        ORDER BY uploaded_at DESC
      `;
    }

    return Response.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error fetching images:", error);
    return Response.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { imageId, aiResponse, isAnalyzed } = body;

    if (!imageId) {
      return Response.json(
        { error: "Missing imageId" },
        { status: 400 }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    // Update AI analysis results
    const result = await sql`
      UPDATE meal_images
      SET 
        ai_response = ${JSON.stringify(aiResponse)},
        is_analyzed = ${isAnalyzed || true}
      WHERE id = ${imageId}
      RETURNING id, is_analyzed, ai_response
    `;

    return Response.json(
      { success: true, data: result[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating image:", error);
    return Response.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}
