// foodStreakService.ts
interface FoodEntryForStreak {
  entry_date?: string;
  entryDate?: string;
  logged_at?: string;
  loggedAt?: string;
}

const sortData = (rawData: FoodEntryForStreak[]): Date[] => {
  console.log("sortData - raw input:", rawData);
  const dates = (rawData ?? [])
    .map(entry => {
      const dateStr = entry.entry_date || entry.entryDate || entry.logged_at || entry.loggedAt;
      console.log("Processing entry:", entry, "-> dateStr:", dateStr);
      return dateStr ? new Date(dateStr) : null;
    })
    .filter((date): date is Date => {
      const isValid = date instanceof Date && !isNaN(date.getTime());
      if (date) console.log("Date:", date, "valid:", isValid);
      return isValid;
    })
    .sort((a, b) => a.getTime() - b.getTime());

  console.log("sortData - final dates:", dates);
  return dates;
};

export const findFoodStreaks = (foodData: FoodEntryForStreak[]) => {
  console.log("findFoodStreaks called with data:", foodData);
  const sortedDates = sortData(foodData);
  console.log("Sorted dates:", sortedDates);

  if (sortedDates.length === 0) return { longestStreak: 0, activeStreak: 0 };

  const oneDayMs = 24 * 60 * 60 * 1000;

  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Get unique days (in case there are multiple entries per day)
  const uniqueDays = Array.from(
    new Set(sortedDates.map(date => startOfDay(date).getTime()))
  )
    .map(time => new Date(time))
    .sort((a, b) => a.getTime() - b.getTime());

  console.log("Unique days:", uniqueDays);

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

  console.log("Today:", new Date(today));
  console.log("Most recent day:", new Date(mostRecentDay));
  console.log("Diff in days:", (today - mostRecentDay) / oneDayMs);

  // If the most recent entry is not today or yesterday, no active streak
  if (today - mostRecentDay > oneDayMs) {
    console.log("Streak broken - most recent entry is too old");
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

  console.log("Final streak:", { longestStreak, activeStreak: currentStreak });
  return { longestStreak, activeStreak: currentStreak };
};
