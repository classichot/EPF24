import names from "@/lib/pvd-funds.json";
import english from "@/lib/pvd-en.json";

export type PvdFund = { name: string; en: string; type: string };

export function fundType(name: string) {
  if (/ไลฟ|สมดุลตามอายุ|life\s*path/i.test(name)) return "Life Path";
  if (/ตราสารทุน|หุ้น|equity/i.test(name)) return "Equity";
  if (/ตราสารหนี้|ตลาดเงิน|พันธบัตร|fixed income|money market/i.test(name)) return "Fixed income";
  if (/ผสม|สมดุล|balanced/i.test(name)) return "Balanced";
  return "Provident fund";
}

/** Pooled product nicknames. Everything else on the register is an employer fund. */
const PRODUCTS = new Set([
  "กรุงไทย มาสเตอร์ พูล ฟันด์",
  "กสิกรไทยทรัพย์มั่นคง",
  "เกษียณมั่งคั่ง",
  "เค มาสเตอร์ พูล ฟันด์",
  "ทรัพย์มั่นคง",
  "ทหารไทยเพิ่มพูนผล 2",
  "ทิสโก้มาสเตอร์ร่วมทุน",
  "ทิสโก้ร่วมทุน 1",
  "ทิสโก้ร่วมทุน 2",
  "ทิสโก้ร่วมทุนมั่นคง",
  "ไทยพาณิชย์ทรัพย์เพิ่มพูน",
  "ไทยพาณิชย์เปี่ยมทรัพย์",
  "ไทยพาณิชย์เพิ่มผล 1",
  "ไทยพาณิชย์ มาสเตอร์ฟันด์",
  "ไทยมั่นคง มาสเตอร์ พูล ฟันด์",
  "ธนชาติทวีค่า",
  "บัวหลวงทรัพย์มั่งคั่ง",
  "พรินซิเพิล ไลฟ์ ไซเคิล",
  "พรินซิเพิล สมดุลตามอายุ",
  "เฟิร์ส พลัส มาสเตอร์พูล",
  "มหาลาภ",
  "ยูโอบี มาสเตอร์ ฟันด์",
  "ยูโอบี สวัสดิการมั่นคง 1",
  "ยูโอบี สวัสดิการมั่นคง 2",
  "ยูโอบี อินเวสเตอร์ ชอยส์",
  "วรรณเอเอ็มมาสเตอร์ฟันด์",
  "สวัสดิการมั่นคง",
  "สวัสดิทรัพย์",
  "สหทรัพย์",
  "สินทวี",
  "อเบอร์ดีน มาสเตอร์พูล",
  "อยุธยาตราสารผสม",
  "อยุธยาตราสารหนี้",
  "อยุธยาพันธบัตร",
  "อยุธยามาสเตอร์ฟันด์",
  "เอ็มเอฟซีมาสเตอร์ ฟันด์",
  "เอไอเอมาสเตอร์พูล",
  "แอล เอช ฟันด์ มาสเตอร์พูล",
  "แอสเซท พลัส มาสเตอร์ฟันด์",
  "Eastspring M Choice",
]);

const en = english as Record<string, string>;
const seen = new Set<string>();
const rows: PvdFund[] = (names as string[])
  .map((name) => name.replace(/\s+/g, " ").trim())
  .filter((name) => {
    if (!name || seen.has(name)) return false;
    seen.add(name);
    return true;
  })
  .map((name) => {
    const label = en[name];
    if (!label) throw new Error(`Missing English name for ${name}`);
    return { name, en: label, type: fundType(name) };
  });

export const PVD_PRODUCTS: PvdFund[] = rows.filter((row) => PRODUCTS.has(row.name));
export const PVD_EMPLOYERS: PvdFund[] = rows
  .filter((row) => !PRODUCTS.has(row.name))
  .sort((a, b) => a.en.localeCompare(b.en));

export const PVD_MANAGERS: { name: string; en: string; life: boolean; rmf: boolean }[] = [
  { en: "Krungthai Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน กรุงไทย จำกัด (มหาชน)", life: true, rmf: true },
  { en: "Krungsri Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน กรุงศรี จำกัด", life: true, rmf: true },
  { en: "Kasikorn Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน กสิกรไทย จำกัด", life: true, rmf: true },
  { en: "First Plus Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน เฟิร์ส พลัส (ประเทศไทย) จำกัด", life: false, rmf: false },
  { en: "TISCO Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน ทิสโก้ จำกัด", life: true, rmf: false },
  { en: "SCB Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน ไทยพาณิชย์ จำกัด", life: true, rmf: true },
  { en: "BBL Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุนรวม บัวหลวง จำกัด", life: true, rmf: false },
  { en: "Bangkok Capital Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน บางกอกแคปปิตอล จำกัด", life: true, rmf: false },
  { en: "Principal Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน พรินซิเพิล จำกัด", life: true, rmf: true },
  { en: "UOB Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน ยูโอบี (ประเทศไทย) จำกัด", life: true, rmf: false },
  { en: "LH Fund", name: "บริษัทหลักทรัพย์จัดการกองทุน แลนด์ แอนด์ เฮ้าส์ จำกัด", life: true, rmf: false },
  { en: "ONE Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน วรรณ จำกัด", life: true, rmf: false },
  { en: "abrdn", name: "บริษัทหลักทรัพย์จัดการกองทุน อเบอร์ดีน (ประเทศไทย) จำกัด", life: false, rmf: false },
  { en: "Eastspring", name: "บริษัทหลักทรัพย์จัดการกองทุน อีสท์สปริง (ประเทศไทย) จำกัด", life: true, rmf: true },
  { en: "MFC Asset Management", name: "บริษัทหลักทรัพย์จัดการกองทุน เอ็มเอฟซี จำกัด (มหาชน)", life: true, rmf: true },
  { en: "Asset Plus", name: "บริษัทหลักทรัพย์จัดการกองทุน แอสเซท พลัส จำกัด", life: true, rmf: false },
  { en: "AIA", name: "บริษัท เอไอเอ จำกัด", life: false, rmf: false },
];
