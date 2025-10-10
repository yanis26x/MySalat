// src/prayerTimes.ts
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from "adhan";

export type DailyPrayers = {
  fajr: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
};

/**
 * Calcule les heures de prière pour une date et position données.
 * Compatible avec adhan JS (pas besoin de DateComponents).
 */
export function getPrayerTimesForDate(
  latitude: number,
  longitude: number,
  date: Date
): DailyPrayers {
  const coords = new Coordinates(latitude, longitude);

  // Méthode de calcul par défaut
  const params = CalculationMethod.NorthAmerica();
  params.madhab = Madhab.Shafi;

  // Adhan JS accepte directement un objet Date (local)
  const pt = new PrayerTimes(coords, date, params);

  return {
    fajr: pt.fajr,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
  };
}
