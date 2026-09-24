import names from "@/lib/pvd-funds.json";

export type PvdFund = { name: string; type: string };

export function fundType(name: string) {
  if (/ไลฟ|สมดุลตามอายุ|life\s*path/i.test(name)) return "Life Path";
  if (/ตราสารทุน|หุ้น|equity/i.test(name)) return "Equity";
  if (/ตราสารหนี้|ตลาดเงิน|พันธบัตร|fixed income|money market/i.test(name)) return "Fixed income";
  if (/ผสม|สมดุล|balanced/i.test(name)) return "Balanced";
  return "Provident fund";
}

const seen = new Set<string>();
export const PVD_FUNDS: PvdFund[] = (names as string[])
  .map((name) => name.replace(/\s+/g, " ").trim())
  .filter((name) => {
    if (!name || seen.has(name)) return false;
    seen.add(name);
    return true;
  })
  .map((name) => ({ name, type: fundType(name) }));

export const PVD_MANAGERS: { name: string; life: boolean; rmf: boolean }[] = [
  { name: "บริษัทหลักทรัพย์จัดการกองทุน กรุงไทย จำกัด (มหาชน)", life: true, rmf: true },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน กรุงศรี จำกัด", life: true, rmf: true },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน กสิกรไทย จำกัด", life: true, rmf: true },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน เฟิร์ส พลัส (ประเทศไทย) จำกัด", life: false, rmf: false },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน ทิสโก้ จำกัด", life: true, rmf: false },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน ไทยพาณิชย์ จำกัด", life: true, rmf: true },
  { name: "บริษัทหลักทรัพย์จัดการกองทุนรวม บัวหลวง จำกัด", life: true, rmf: false },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน บางกอกแคปปิตอล จำกัด", life: true, rmf: false },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน พรินซิเพิล จำกัด", life: true, rmf: true },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน ยูโอบี (ประเทศไทย) จำกัด", life: true, rmf: false },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน แลนด์ แอนด์ เฮ้าส์ จำกัด", life: true, rmf: false },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน วรรณ จำกัด", life: true, rmf: false },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน อเบอร์ดีน (ประเทศไทย) จำกัด", life: false, rmf: false },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน อีสท์สปริง (ประเทศไทย) จำกัด", life: true, rmf: true },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน เอ็มเอฟซี จำกัด (มหาชน)", life: true, rmf: true },
  { name: "บริษัทหลักทรัพย์จัดการกองทุน แอสเซท พลัส จำกัด", life: true, rmf: false },
  { name: "บริษัท เอไอเอ จำกัด", life: false, rmf: false },
];
