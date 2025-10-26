// foodStreakService.ts
interface FoodEntryForStreak {
  entry_date?: string;
  logged_at?: string;
}

const sortData = (rawData: FoodEntryForStreak[]): Date[] => {
  return (rawData ?? [])
    .map(entry => {
      const dateStr = entry.entry_date || entry.logged_at;
      return dateStr ? new Date(dateStr) : null;
    })
    .filter((date): date is Date => date instanceof Date && !isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
};

export const findFoodStreaks = (foodData: FoodEntryForStreak[]) => {
  const sortedDates = sortData(foodData);
  if (sortedDates.length === 0) return { longestStreak: 0, activeStreak: 0 };

  const oneDayMs = 24 * 60 * 60 * 1000;

  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Get unique days (in case there are multiple entries per day)
  const uniqueDays = Array.from(
    new Set(sortedDates.map(date => startOfDay(date).getTime()))
  )
    .map(time => new Date(time))
    .sort((a, b) => a.getTime() - b.getTime());

  if (uniqueDays.length === 0) return { longestStreak: 0, activeStreak: 0 };

  let longestStreak = 1;
  let currentStreak = 1;

  // Calculate longest streak
  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDay = uniqueDays[i - 1].getTime();
    const currDay = uniqueDays[i].getTime();

    if (currDay - prevDay === oneDayMs) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) longestStreak = currentStreak;
  }

  // Calculate active streak (ending on the most recent entry)
  // Check if the streak continues up to today or yesterday
  const today = startOfDay(new Date()).getTime();
  const mostRecentDay = uniqueDays[uniqueDays.length - 1].getTime();

  // If the most recent entry is not today or yesterday, no active streak
  if (today - mostRecentDay > oneDayMs) {
    return { longestStreak, activeStreak: 0 };
  }

  currentStreak = 1;
  for (let i = uniqueDays.length - 1; i > 0; i--) {
    const prevDay = uniqueDays[i - 1].getTime();
    const currDay = uniqueDays[i].getTime();

    if (currDay - prevDay === oneDayMs) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { longestStreak, activeStreak: currentStreak };
};
