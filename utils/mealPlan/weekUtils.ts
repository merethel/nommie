import { dateKeyFromDate } from "@/utils/mealPlan/mealPlanStorage";

/**
 * Returns a Date set to the start of the week (Monday) in local time.
 */
export function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);

  // JS: 0=Sun..6=Sat. We want Monday as first day.
  const day = date.getDay();
  const diff = (day + 6) % 7; // Mon->0, Tue->1, ... Sun->6
  date.setDate(date.getDate() - diff);
  return date;
}

export function addDays(d: Date, n: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

export function weekDateKeysFrom(date: Date) {
  const start = startOfWeekMonday(date);
  return Array.from({ length: 7 }, (_, i) =>
    dateKeyFromDate(addDays(start, i)),
  );
}
