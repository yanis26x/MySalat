// src/scheduler.js
import * as Notifications from "expo-notifications";
import { getPrayerTimesForDate } from "./prayerTimes";

// Utility: add N days (local)
function addDays(d, n) {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  copy.setDate(copy.getDate() + n);
  return copy;
}

// Titles for display
const LABELS = [
  ["Fajr", "It's time to pray Fajr."],
  ["Dhuhr", "It's time to pray Dhuhr."],
  ["Asr", "It's time to pray Asr."],
  ["Maghrib", "It's time to pray Maghrib."],
  ["Isha", "It's time to pray Isha."],
];

export async function scheduleNextDays(lat, lon, days = 7) {
  // Clear any old schedules to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  let scheduled = 0;

  for (let i = 0; i < days; i++) {
    const day = addDays(now, i);
    const { fajr, dhuhr, asr, maghrib, isha } = getPrayerTimesForDate(lat, lon, day);
    const list = [
      ["Fajr", fajr],
      ["Dhuhr", dhuhr],
      ["Asr", asr],
      ["Maghrib", maghrib],
      ["Isha", isha],
    ];

    for (const [name, when] of list) {
      // If scheduling "today", skip past times
      if (i === 0 && when.getTime() <= now.getTime()) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: name,
          body: LABELS.find(([n]) => n === name)?.[1] || "It's time to pray.",
          sound: true,
        },
        trigger: when, // absolute local Date
      });
      scheduled++;
    }
  }

  return scheduled; // count of notifications created
}
