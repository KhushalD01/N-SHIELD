import type { Helpline } from "@/lib/validation/assistantSchemas";

/**
 * Official Verified Emergency Helpline Directory for Nagpur & India
 * Sourced from Maharashtra Police, Government of India, and Nagpur Police Commissionerate.
 */
export const VERIFIED_HELPLINES: Helpline[] = [
  {
    id: "help-112",
    name: "Emergency Response Support System (ERSS)",
    number: "112",
    purpose: "Unified single national emergency response for Police, Fire, Ambulance & Disaster rescue",
    scope: "National",
    sourceUrl: "https://112.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-100",
    name: "Police Emergency Dispatch",
    number: "100",
    purpose: "Immediate law enforcement & crime response",
    scope: "National",
    sourceUrl: "https://www.mahapolice.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-101",
    name: "Fire Brigade & Rescue",
    number: "101",
    purpose: "Firefighting, structural collapse rescue, and hazardous spill containment",
    scope: "National",
    sourceUrl: "https://nmcnagpur.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-108",
    name: "Maharashtra EMS Trauma Ambulance",
    number: "108",
    purpose: "Critical trauma, accident response, and life-support ambulance dispatch",
    scope: "State",
    sourceUrl: "https://arogya.maharashtra.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-102",
    name: "Maternal & Child Ambulance (CATS)",
    number: "102",
    purpose: "Free ambulance transport for pregnant mothers and infant medical emergencies",
    scope: "State",
    sourceUrl: "https://nhm.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-1091",
    name: "Women Safety & Distress Helpline",
    number: "1091",
    purpose: "24/7 dedicated support for women facing harassment, stalking, or distress",
    scope: "National",
    sourceUrl: "https://ncw.nic.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-181",
    name: "Women Helpline (Domestic Violence Support)",
    number: "181",
    purpose: "Counseling, immediate shelter rescue, and legal aid for domestic violence survivors",
    scope: "National",
    sourceUrl: "https://wcd.nic.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-1098",
    name: "Childline India",
    number: "1098",
    purpose: "Emergency rescue, protection, and psychological aid for children in distress",
    scope: "National",
    sourceUrl: "https://wcd.nic.in/childline-1098",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-1930",
    name: "National Cyber Crime Reporting Helpline",
    number: "1930",
    purpose: "Immediate financial cyber fraud freeze and online harassment reporting",
    scope: "National",
    sourceUrl: "https://cybercrime.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-ngp-control",
    name: "Nagpur Police Central Control Room",
    number: "0712-2561222",
    purpose: "City police headquarters direct dispatch and critical alert desk",
    scope: "Local",
    sourceUrl: "https://nagpurpolice.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-ngp-whatsapp",
    name: "Nagpur Police WhatsApp SOS / Citizen Evidence",
    number: "09823300100",
    purpose: "Official WhatsApp channel for photo/video incident reporting and distress chat",
    scope: "Local",
    sourceUrl: "https://nagpurpolice.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-ngp-disaster",
    name: "Nagpur District Disaster Control Room",
    number: "0712-2562668",
    purpose: "District Collectorate emergency desk for floods, storms, and civil disasters",
    scope: "Local",
    sourceUrl: "https://nagpur.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-elderline",
    name: "Elderline (Senior Citizens Helpline)",
    number: "14567",
    purpose: "Abuse intervention, rescue, healthcare navigation, and elder welfare",
    scope: "National",
    sourceUrl: "https://socialjustice.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
  {
    id: "help-telemanas",
    name: "Tele-MANAS Mental Health Support",
    number: "14416",
    purpose: "24/7 tele-mental health counseling and psychological distress crisis assistance",
    scope: "National",
    sourceUrl: "https://telemanas.mohfw.gov.in/",
    verifiedAt: "2025-01-15T00:00:00.000Z",
    activeStatus: "verified_active",
    is24x7: true,
  },
];

/**
 * Filter helplines based on query or intent
 */
export function getHelplines(query?: string): Helpline[] {
  if (!query || !query.trim()) return VERIFIED_HELPLINES;
  const q = query.toLowerCase().trim();
  return VERIFIED_HELPLINES.filter(
    (h) =>
      h.name.toLowerCase().includes(q) ||
      h.number.includes(q) ||
      h.purpose.toLowerCase().includes(q) ||
      h.scope.toLowerCase().includes(q)
  );
}
