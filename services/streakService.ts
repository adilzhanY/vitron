// streakService.ts
import { WeightEntry } from '@/types/type';

const sortData = (rawData: any[]): WeightEntry[] => {
  return (rawData ?? [])
    .map(entry => ({
      weight: Number(entry.weight),
      date: new Date(entry.logged_at || entry.date),
    }))
    .filter(e => !Number.isNaN(e.weight) && e.date instanceof Date && !isNaN(e.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const findStreaks = (weightData: WeightEntry[]) => {
  const sortedData = sortData(weightData);
  if (sortedData.length === 0) return { longestStreak: 0, activeStreak: 0 };

  const oneDayMs = 24 * 60 * 60 * 1000;

  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  let longestStreak = 1;
  let currentStreak = 1;

  // Calculate longest streak
  for (let i = 1; i < sortedData.length; i++) {
    const prevDay = startOfDay(sortedData[i - 1].date).getTime();
    const currDay = startOfDay(sortedData[i].date).getTime();

    if (currDay - prevDay === oneDayMs) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) longestStreak = currentStreak;
  }

  // Calculate active streak (ending on the most recent entry)
  currentStreak = 1;
  for (let i = sortedData.length - 1; i > 0; i--) {
    const prevDay = startOfDay(sortedData[i - 1].date).getTime();
    const currDay = startOfDay(sortedData[i].date).getTime();

    if (currDay - prevDay === oneDayMs) {
      currentStreak++;
    } else {
      break;
    }
  }
  const activeStreak = currentStreak;

  return { longestStreak, activeStreak };
};

