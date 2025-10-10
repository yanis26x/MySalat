// src/qibla.ts
// Calcul de l'azimut (bearing initial) vers la Kaaba depuis (lat, lon)

const KAABA = { lat: 21.422487, lon: 39.826206 }; // Makkah

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

/**
 * Retourne l'azimut Qibla (0–360° depuis le Nord, sens horaire)
 */
export function qiblaBearing(lat: number, lon: number): number {
  const φ1 = toRad(lat);
  const λ1 = toRad(lon);
  const φ2 = toRad(KAABA.lat);
  const λ2 = toRad(KAABA.lon);

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);

  let θ = Math.atan2(y, x); // -π..π
  let brng = (toDeg(θ) + 360) % 360; // 0..360
  return brng;
}

/**
 * Normalise un angle en 0..360
 */
export function norm360(a: number): number {
  return ((a % 360) + 360) % 360;
}
