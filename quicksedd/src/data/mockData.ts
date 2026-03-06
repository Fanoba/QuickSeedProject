// ── mockData.ts ──────────────────────────────────────────────────────────────
// Datos estáticos de demostración. Se usan cuando:
//   - VITE_USE_MOCK=true en .env.local
//   - El backend no está disponible (fallback automático en los hooks)
// NO borrar este archivo; los hooks lo importan como fallback.

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  goal: number;
  raised: number;
  donors: number;
}

export const projects: Project[] = [
  { id: "1", title: "Reforestación Sierra Norte", description: "Plantación de 50,000 árboles nativos en la Sierra Norte de Puebla para restaurar ecosistemas degradados y mejorar la calidad del agua.", category: "Medio Ambiente", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600", goal: 2500000, raised: 1850000, donors: 342 },
  { id: "2", title: "Educación Rural Oaxaca", description: "Becas y materiales educativos para 200 estudiantes en comunidades rurales de Oaxaca, incluyendo acceso a tecnología.", category: "Educación", image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600", goal: 1800000, raised: 920000, donors: 189 },
  { id: "3", title: "Agua Limpia Chiapas", description: "Instalación de sistemas de purificación de agua en 15 comunidades indígenas de Chiapas para garantizar acceso a agua potable.", category: "Salud", image: "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=600", goal: 3200000, raised: 2100000, donors: 567 },
  { id: "4", title: "Huertos Comunitarios CDMX", description: "Creación de 30 huertos urbanos comunitarios en zonas vulnerables de la Ciudad de México para promover la seguridad alimentaria.", category: "Alimentación", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600", goal: 900000, raised: 650000, donors: 128 },
  { id: "5", title: "Empoderamiento de Mujeres", description: "Programa de capacitación en oficios y emprendimiento para 500 mujeres en situación vulnerable en Guerrero.", category: "Social", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600", goal: 1500000, raised: 480000, donors: 95 },
  { id: "6", title: "Conservación Mariposa Monarca", description: "Protección de 500 hectáreas de bosque en Michoacán para preservar el hábitat de la mariposa monarca.", category: "Medio Ambiente", image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600", goal: 4000000, raised: 3200000, donors: 890 },
];

export const categories = ["Todos", "Medio Ambiente", "Educación", "Salud", "Alimentación", "Social"];

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  project: string;
  amount: number;
  date: string;
  documentMatch: number;
  status: "verified" | "pending" | "flagged";
  riskLevel: "low" | "medium" | "high";
  ip: string;
  location: string;
}

export const donations: Donation[] = [
  { id: "D001", donorId: "USR-4821", donorName: "María García", project: "Reforestación Sierra Norte", amount: 750000, date: "2026-03-01", documentMatch: 98, status: "verified", riskLevel: "low", ip: "187.190.45.12", location: "CDMX, México" },
  { id: "D002", donorId: "USR-1293", donorName: "Carlos Méndez", project: "Educación Rural Oaxaca", amount: 1200000, date: "2026-03-02", documentMatch: 72, status: "pending", riskLevel: "medium", ip: "201.141.78.33", location: "Monterrey, México" },
  { id: "D003", donorId: "USR-7744", donorName: "Ana López", project: "Agua Limpia Chiapas", amount: 2500000, date: "2026-03-02", documentMatch: 45, status: "flagged", riskLevel: "high", ip: "89.205.11.44", location: "Madrid, España" },
  { id: "D004", donorId: "USR-3391", donorName: "Roberto Silva", project: "Huertos Comunitarios", amount: 150000, date: "2026-03-03", documentMatch: 95, status: "verified", riskLevel: "low", ip: "187.190.12.88", location: "Guadalajara, México" },
  { id: "D005", donorId: "USR-5562", donorName: "Laura Torres", project: "Empoderamiento de Mujeres", amount: 600000, date: "2026-03-03", documentMatch: 88, status: "verified", riskLevel: "low", ip: "201.141.22.11", location: "Puebla, México" },
  { id: "D006", donorId: "USR-1293", donorName: "Carlos Méndez", project: "Conservación Monarca", amount: 3500000, date: "2026-03-03", documentMatch: 65, status: "flagged", riskLevel: "high", ip: "45.33.90.12", location: "Miami, USA" },
  { id: "D007", donorId: "USR-1293", donorName: "Carlos Méndez", project: "Agua Limpia Chiapas", amount: 800000, date: "2026-02-28", documentMatch: 70, status: "pending", riskLevel: "medium", ip: "201.141.78.33", location: "Monterrey, México" },
  { id: "D008", donorId: "USR-4821", donorName: "María García", project: "Educación Rural Oaxaca", amount: 300000, date: "2026-01-20", documentMatch: 98, status: "verified", riskLevel: "low", ip: "187.190.45.12", location: "CDMX, México" },
  { id: "D009", donorId: "USR-7744", donorName: "Ana López", project: "Reforestación Sierra Norte", amount: 1200000, date: "2026-02-20", documentMatch: 48, status: "pending", riskLevel: "high", ip: "89.205.11.44", location: "Madrid, España" },
  { id: "D010", donorId: "USR-1293", donorName: "Carlos Méndez", project: "Reforestación Sierra Norte", amount: 500000, date: "2026-01-15", documentMatch: 68, status: "pending", riskLevel: "medium", ip: "187.190.45.12", location: "CDMX, México" },
];

export const alerts = [
  { id: 1, type: "ip" as const, message: "USR-1293 realizó donaciones desde 3 IPs diferentes en 24hrs", severity: "high" as const, date: "2026-03-03" },
  { id: 2, type: "location" as const, message: "USR-7744 ubicación inconsistente: Madrid → CDMX en 2hrs", severity: "high" as const, date: "2026-03-02" },
  { id: 3, type: "speed" as const, message: "USR-9021 realizó 5 donaciones en menos de 3 minutos", severity: "medium" as const, date: "2026-03-01" },
  { id: 4, type: "amount" as const, message: "Donación de $3,500,000 excede umbral de revisión", severity: "medium" as const, date: "2026-03-03" },
  { id: 5, type: "document" as const, message: "⚠️ Constancia fiscal de Carlos Méndez vence en 2 meses (2026-05-03)", severity: "high" as const, date: "2026-03-05" },
  { id: 6, type: "document" as const, message: "⚠️ Constancia fiscal de Laura Torres vence en 3 meses (2026-06-01)", severity: "medium" as const, date: "2026-03-05" },
  { id: 7, type: "fiscal" as const, message: "📅 Cierre del año fiscal 2026 se aproxima (31 de diciembre). Genera reportes fiscales para donantes.", severity: "medium" as const, date: "2026-03-05" },
  { id: 8, type: "fraud" as const, message: "🔴 USR-1293 (Carlos Méndez) tiene 4 donaciones desde la misma cuenta a diferentes proyectos – posible actividad sospechosa", severity: "high" as const, date: "2026-03-03" },
];

export const monthlyDonations = [
  { month: "Ene", amount: 1200000, count: 45 },
  { month: "Feb", amount: 980000, count: 38 },
  { month: "Mar", amount: 1850000, count: 62 },
  { month: "Abr", amount: 1450000, count: 51 },
  { month: "May", amount: 2100000, count: 78 },
  { month: "Jun", amount: 1780000, count: 65 },
  { month: "Jul", amount: 2350000, count: 89 },
  { month: "Ago", amount: 1920000, count: 71 },
  { month: "Sep", amount: 2680000, count: 95 },
  { month: "Oct", amount: 3100000, count: 112 },
  { month: "Nov", amount: 2450000, count: 88 },
  { month: "Dic", amount: 3800000, count: 134 },
];

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  rfc: string;
  location: string;
  avatar: string;
  riskLevel: "low" | "medium" | "high";
  totalDonated: number;
  donationCount: number;
  joinDate: string;
  constanciaExpiry: string;
  documents: { ine: boolean; constanciaFiscal: boolean; curp: boolean };
  recentDonations: { project: string; amount: number; date: string; status: "verified" | "pending" | "flagged" }[];
}

export const donors: Donor[] = [
  { id: "USR-4821", name: "María García", email: "maria.garcia@email.com", phone: "+52 55 1234-5678", rfc: "GARM850215ABC", location: "CDMX, México", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", riskLevel: "low", totalDonated: 2350000, donationCount: 8, joinDate: "2025-06-15", constanciaExpiry: "2027-01-15", documents: { ine: true, constanciaFiscal: true, curp: true }, recentDonations: [{ project: "Reforestación Sierra Norte", amount: 750000, date: "2026-03-01", status: "verified" }, { project: "Agua Limpia Chiapas", amount: 500000, date: "2026-02-15", status: "verified" }] },
  { id: "USR-1293", name: "Carlos Méndez", email: "carlos.mendez@email.com", phone: "+52 81 9876-5432", rfc: "MECC900810XYZ", location: "Monterrey, México", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", riskLevel: "high", totalDonated: 5800000, donationCount: 12, joinDate: "2025-09-01", constanciaExpiry: "2026-05-03", documents: { ine: true, constanciaFiscal: false, curp: true }, recentDonations: [{ project: "Conservación Monarca", amount: 3500000, date: "2026-03-03", status: "flagged" }, { project: "Educación Rural Oaxaca", amount: 1200000, date: "2026-03-02", status: "pending" }] },
  { id: "USR-7744", name: "Ana López", email: "ana.lopez@email.com", phone: "+34 612 345 678", rfc: "N/A", location: "Madrid, España", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", riskLevel: "high", totalDonated: 4200000, donationCount: 5, joinDate: "2026-01-10", constanciaExpiry: "N/A", documents: { ine: false, constanciaFiscal: false, curp: false }, recentDonations: [{ project: "Agua Limpia Chiapas", amount: 2500000, date: "2026-03-02", status: "flagged" }] },
  { id: "USR-3391", name: "Roberto Silva", email: "roberto.silva@email.com", phone: "+52 33 4567-8901", rfc: "SILR880320DEF", location: "Guadalajara, México", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", riskLevel: "low", totalDonated: 890000, donationCount: 6, joinDate: "2025-11-20", constanciaExpiry: "2027-03-20", documents: { ine: true, constanciaFiscal: true, curp: true }, recentDonations: [{ project: "Huertos Comunitarios", amount: 150000, date: "2026-03-03", status: "verified" }] },
  { id: "USR-5562", name: "Laura Torres", email: "laura.torres@email.com", phone: "+52 222 345-6789", rfc: "TORL910515GHI", location: "Puebla, México", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", riskLevel: "low", totalDonated: 1650000, donationCount: 9, joinDate: "2025-08-05", constanciaExpiry: "2026-06-01", documents: { ine: true, constanciaFiscal: true, curp: false }, recentDonations: [{ project: "Empoderamiento de Mujeres", amount: 600000, date: "2026-03-03", status: "verified" }] },
];

export interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
  donations: number;
  amount: number;
}

export const locationMapData: LocationPoint[] = [
  { name: "CDMX, México", lat: 19.43, lng: -99.13, donations: 45, amount: 3200000 },
  { name: "Monterrey, México", lat: 25.67, lng: -100.31, donations: 28, amount: 2400000 },
  { name: "Guadalajara, México", lat: 20.67, lng: -103.35, donations: 18, amount: 1100000 },
  { name: "Puebla, México", lat: 19.04, lng: -98.20, donations: 15, amount: 980000 },
  { name: "Madrid, España", lat: 40.42, lng: -3.70, donations: 8, amount: 3700000 },
  { name: "Miami, USA", lat: 25.76, lng: -80.19, donations: 5, amount: 3500000 },
  { name: "Oaxaca, México", lat: 17.07, lng: -96.72, donations: 12, amount: 650000 },
  { name: "Chiapas, México", lat: 16.75, lng: -93.12, donations: 9, amount: 420000 },
];

export const fraudScatterData = (() => {
  const grouped: Record<string, { donorId: string; donorName: string; donations: { amount: number; date: string; project: string; ip: string; location: string }[] }> = {};
  donations.forEach((d) => {
    if (!grouped[d.donorId]) grouped[d.donorId] = { donorId: d.donorId, donorName: d.donorName, donations: [] };
    grouped[d.donorId].donations.push({ amount: d.amount, date: d.date, project: d.project, ip: d.ip, location: d.location });
  });
  return Object.values(grouped)
    .filter((g) => g.donations.length >= 2)
    .flatMap((g) => {
      const uniqueIPs = new Set(g.donations.map((d) => d.ip)).size;
      const uniqueLocations = new Set(g.donations.map((d) => d.location)).size;
      return g.donations.map((d, i) => ({
        donorId: g.donorId,
        donorName: g.donorName,
        amount: d.amount / 1000000,
        donationIndex: i + 1,
        totalDonations: g.donations.length,
        project: d.project,
        date: d.date,
        dateTimestamp: new Date(d.date).getTime(),
        ip: d.ip,
        location: d.location,
        uniqueIPs,
        uniqueLocations,
        suspicious: g.donations.length >= 3 || uniqueIPs >= 2 || uniqueLocations >= 2,
      }));
    });
})();
