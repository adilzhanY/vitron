CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    clerk_id VARCHAR(50) UNIQUE NOT NULL,
    gender VARCHAR(50) CHECK (gender IN ('male', 'female')),
    initial_weight DECIMAL(5,2),
    height DECIMAL(5,2),
    measurements_filled BOOLEAN DEFAULT FALSE,
    goal VARCHAR(20) CHECK (goal IN ('lose weight', 'gain weight', 'be fit')),
    created_at TIMESTAMP DEFAULT NOW(),
    activity_level activity_level_enum,
    unit_system VARCHAR(10) CHECK (unit_system IN ('metric', 'imperial')) DEFAULT 'metric',
    birthday DATE
);

CREATE TYPE activity_level_enum AS ENUM (
    'sedentary',
    'lightly active',
    'moderately active',
    'very active',
    'extremely active'
);

CREATE TABLE weights (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL,
    logged_at TIMESTAMP DEFAULT NOW(),
    logged_date DATE GENERATED ALWAYS AS (DATE(logged_at)) STORED,
    UNIQUE (user_id, logged_date)
);

CREATE TYPE body_part AS ENUM (
  'bust',
  'calf',
  'chest',
  'forearm',
  'hip',
  'neck',
  'quadriceps',
  'shoulders',
  'upper_arm',
  'waist',
  'wrist'
);

CREATE TABLE measurements (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body_part body_part NOT NULL,  -- enum
    value DECIMAL(5,2) NOT NULL,   -- in cm
    logged_at TIMESTAMP DEFAULT NOW(),
    logged_date DATE GENERATED ALWAYS AS (DATE(logged_at)) STORED,
    UNIQUE (user_id, body_part, logged_date)
);


CREATE TABLE weight_goals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkpoints INT DEFAULT 0,
    start_weight DECIMAL(5,2) NOT NULL,
    target_weight DECIMAL(5,2) NOT NULL,
    daily_calorie_goal INT,
    created_at TIMESTAMP DEFAULT NOW(),
    end_date DATE,
    achieved BOOLEAN DEFAULT FALSE
);


CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- create table using the enum
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    calories INT NOT NULL,
    protein DECIMAL(6,2),
    carbs DECIMAL(6,2),
    fat DECIMAL(6,2),
    meal_type meal_type NOT NULL,
    logged_at TIMESTAMP DEFAULT NOW(),
    is_saved BOOLEAN DEFAULT FALSE
);

CREATE TABLE meal_goals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    calories_target INT NOT NULL,
    protein_target DECIMAL(6,2),
    carbs_target DECIMAL(6,2),
    fat_target DECIMAL(6,2),
    goal_date DATE NOT NULL,
    related_weight_goal_id INT REFERENCES weight_goals(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE daily_water_intake (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    date DATE NOT NULL,
    total_consumed INT DEFAULT 0, -- in ml
    daily_goal INT DEFAULT 2500,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    exercise_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    gif_url VARCHAR(255),
    target_muscles JSONB,
    body_parts JSONB,
    equipments JSONB,
    secondary_muscles JSONB,
    instructions JSONB
);


-- CREATE TABLE saved_meals (
--     id SERIAL PRIMARY KEY,
--     user_id INT REFERENCES users(id) ON DELETE CASCADE,
--     meal_id INT REFERENCES meals(id) ON DELETE CASCADE,
-- )


-- CREATE TABLE activities (
--     id SERIAL PRIMARY KEY,
--     user_id INT REFERENCES users(id) ON DELETE CASCADE,
--     type VARCHAR(100) NOT NULL, -- e.g. "running", "swimming"
--     custom_name VARCHAR(100),   -- user-defined activity
--     distance_km DECIMAL(6,2),   -- optional
--     duration_minutes INT,       -- optional
--     calories_burned INT,        -- optional or calculated
--     logged_at TIMESTAMP DEFAULT NOW()
-- );


-- CREATE TABLE workouts (
--     id SERIAL PRIMARY KEY,
--     user_id INT REFERENCES users(id) ON DELETE CASCADE,
--     name VARCHAR(100) NOT NULL, -- "Push Day", "Legs", etc.
--     created_at TIMESTAMP DEFAULT NOW()
-- );


-- CREATE TABLE exercises (
--     id SERIAL PRIMARY KEY,
--     workout_id INT REFERENCES workouts(id) ON DELETE CASCADE,
--     name VARCHAR(100) NOT NULL, -- e.g. "Bench Press"
--     muscle_group VARCHAR(50),   -- e.g. "Chest", "Biceps"
--     priority BOOLEAN DEFAULT FALSE
-- );


-- CREATE TABLE exercise_sets (
--     id SERIAL PRIMARY KEY,
--     exercise_id INT REFERENCES exercises(id) ON DELETE CASCADE,
--     reps INT NOT NULL,
--     weight DECIMAL(6,2), -- in kg
--     until_failure BOOLEAN DEFAULT FALSE
-- );


-- CREATE TABLE measurements (
--     id SERIAL PRIMARY KEY,
--     user_id INT REFERENCES users(id) ON DELETE CASCADE,
--     body_part VARCHAR(50) NOT NULL, -- e.g. "Biceps"
--     value DECIMAL(6,2) NOT NULL,    -- cm
--     logged_at TIMESTAMP DEFAULT NOW()
-- );


-- CREATE TABLE streaks (
--     id SERIAL PRIMARY KEY,
--     user_id INT REFERENCES users(id) ON DELETE CASCADE,
--     type VARCHAR(50) NOT NULL, -- "weight", "calories", "activity"
--     current_streak INT DEFAULT 0,
--     longest_streak INT DEFAULT 0,
--     updated_at TIMESTAMP DEFAULT NOW()
-- );


