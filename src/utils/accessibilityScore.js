/**
 * accessibilityScore.js
 * Mehmonxonaning inklyuziv qulayliklar darajasini hisoblaydi (0–100%)
 */

export const calcAccessibilityScore = (hotel) => {
  if (!hotel) return 0;

  const checks = [
    hotel.accessibility?.mobility?.wheelchairAccessible,
    hotel.accessibility?.mobility?.stepFreeRoute,
    hotel.accessibility?.mobility?.accessibleParking,
    hotel.accessibility?.mobility?.accessibleToilet,
    hotel.accessibility?.mobility?.accessibleRooms,
    hotel.accessibility?.visual?.brailleSigns,
    hotel.accessibility?.visual?.tactilePaving,
    hotel.accessibility?.visual?.highContrastSignage,
    hotel.accessibility?.auditory?.audioGuides,
    hotel.accessibility?.auditory?.hearingLoop,
    hotel.accessibility?.auditory?.signLanguageStaff,
    hotel.accessibility?.cognitive?.quietZones,
    hotel.accessibility?.cognitive?.easyToReadSignage,
    hotel.accessibility?.support?.serviceAnimalFriendly,
    hotel.familyAndElderly?.strollerAccessible,
    hotel.familyAndElderly?.medicalServiceOnSite,
  ];

  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
};

/**
 * Skorga mos rang qaytaradi
 * @returns {{ color: string, bg: string, label: string }}
 */
export const getScoreStyle = (score) => {
  if (score >= 75) return { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Juda qulay' };
  if (score >= 50) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Qisman qulay' };
  return              { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)',      label: "Ma'lumot yetarli emas" };
};

/**
 * Foydalanuvchi accessibility profiliga asosan mehmonxonalarga skor beradi
 * va eng mos 4 tasini qaytaradi.
 *
 * @param {Array}  hotels  - barcha mehmonxonalar massivi
 * @param {Object} prefs   - { wheelchair, blind, deaf, family }
 * @returns {Array}
 */
export const recommend = (hotels, prefs = {}) => {
  return hotels
    .map((h) => {
      let score = (h.rating || 0) * 10;
      if (prefs.wheelchair && h.accessibility?.mobility?.wheelchairAccessible) score += 30;
      if (prefs.wheelchair && h.accessibility?.mobility?.stepFreeRoute)        score += 15;
      if (prefs.blind      && h.accessibility?.auditory?.audioGuides)          score += 25;
      if (prefs.blind      && h.accessibility?.visual?.brailleSigns)           score += 20;
      if (prefs.deaf       && h.accessibility?.auditory?.hearingLoop)          score += 25;
      if (prefs.deaf       && h.accessibility?.auditory?.signLanguageStaff)    score += 20;
      if (prefs.family     && h.familyAndElderly?.strollerAccessible)          score += 15;
      if (prefs.family     && h.familyAndElderly?.medicalServiceOnSite)        score += 10;
      return { ...h, _recScore: score };
    })
    .sort((a, b) => b._recScore - a._recScore)
    .slice(0, 4);
};
