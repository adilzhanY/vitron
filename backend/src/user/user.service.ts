import { Injectable } from "@nestjs/common";
import { neon } from "@neondatabase/serverless";

@Injectable()
export class UserService {
  private sql = neon(process.env.DATABASE_URL!);

  async getUser(clerkId: string) {
    const result = await this.sql`
      SELECT * FROM users WHERE clerk_id = ${clerkId}
    `;
    return result[0];
  }

  async createUser(name, email, clerkId) {
    const result = await this.sql`
      INSERT INTO users (name, email, clerk_id)
      VALUES (${name}, ${email}, ${clerkId})
      RETURNING *
    `;
    return result[0];
  }

  async updateUser(clerkId, data) {
    // your PATCH logic
  }

  async getUserStatus(clerkId: string) {
    const result = await this.sql`
      SELECT measurements_filled FROM users WHERE clerk_id = ${clerkId}
    `;

    if (result.length === 0) {
      // User not found, return default
      return { measurementsFilled: false };
    }

    return { measurementsFilled: result[0].measurements_filled };
  }
}