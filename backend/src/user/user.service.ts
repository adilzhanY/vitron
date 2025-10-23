import { Injectable } from "@nestjs/common";
import { neon } from "@neondatabase/serverless";

// Helper function to format birthday
const formatBirthday = (birthday: any): string | null => {
  if (!birthday) return null;

  if (typeof birthday === 'string' && /^\d{4}-\d{2}-\d{2}/.test(birthday)) {
    return birthday.split('T')[0];
  }

  if (birthday instanceof Date) {
    return birthday.toISOString().split('T')[0];
  }

  const timestamp = typeof birthday === 'string' ? parseInt(birthday) : birthday;
  if (!isNaN(timestamp) && timestamp > 0) {
    return new Date(timestamp).toISOString().split('T')[0];
  }

  return null;
};

@Injectable()
export class UserService {
  private sql = neon(process.env.DATABASE_URL!);

  async getUser(clerkId: string) {
    const result = await this.sql`
      SELECT * FROM users WHERE clerk_id = ${clerkId}
    `;

    if (!result || result.length === 0) {
      return null;
    }

    const user = result[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      clerkId: user.clerk_id,
      birthday: formatBirthday(user.birthday),
      gender: user.gender,
      initialWeight: user.initial_weight,
      height: user.height,
      goal: user.goal,
      activityLevel: user.activity_level,
      unitSystem: user.unit_system,
      measurementsFilled: user.measurements_filled,
    };
  }

  async createUser(name, email, clerkId) {
    const result = await this.sql`
      INSERT INTO users (name, email, clerk_id)
      VALUES (${name}, ${email}, ${clerkId})
      RETURNING *
    `;

    const user = result[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      clerkId: user.clerk_id,
      birthday: formatBirthday(user.birthday),
      gender: user.gender,
      initialWeight: user.initial_weight,
      height: user.height,
      goal: user.goal,
      activityLevel: user.activity_level,
      unitSystem: user.unit_system,
      measurementsFilled: user.measurements_filled,
    };
  }

  async updateUser(clerkId: string, data: any) {
    const currentUser = await this.getUser(clerkId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    const birthday = data.birthday !== undefined ? data.birthday : currentUser.birthday;
    const gender = data.gender !== undefined ? data.gender : currentUser.gender;
    const initialWeight = data.weight !== undefined ? data.weight : currentUser.initialWeight;
    const height = data.height !== undefined ? data.height : currentUser.height;
    const goal = data.goal !== undefined ? data.goal : currentUser.goal;
    const activityLevel = data.activityLevel !== undefined ? data.activityLevel : currentUser.activityLevel;
    const unitSystem = data.unitSystem !== undefined ? data.unitSystem : currentUser.unitSystem;
    const measurementsFilled = true; // Always set to true when updating

    const result = await this.sql`
      UPDATE users 
      SET 
        birthday = ${birthday},
        gender = ${gender},
        initial_weight = ${initialWeight},
        height = ${height},
        goal = ${goal},
        activity_level = ${activityLevel},
        unit_system = ${unitSystem},
        measurements_filled = ${measurementsFilled}
      WHERE clerk_id = ${clerkId}
      RETURNING *
    `;

    const updated = result[0];

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      clerkId: updated.clerk_id,
      birthday: formatBirthday(updated.birthday),
      gender: updated.gender,
      initialWeight: updated.initial_weight,
      height: updated.height,
      goal: updated.goal,
      activityLevel: updated.activity_level,
      unitSystem: updated.unit_system,
      measurementsFilled: updated.measurements_filled,
    };
  }

  async getUserStatus(clerkId: string) {
    const result = await this.sql`
      SELECT measurements_filled FROM users WHERE clerk_id = ${clerkId}
    `;

    if (result.length === 0) {
      return { measurementsFilled: false };
    }

    return { measurementsFilled: result[0].measurements_filled };
  }
}
