/**
 * Ethiopian Calendar Utilities
 * Provides conversion between Gregorian and Ethiopian (Ge'ez) calendars,
 * Ethiopian month boundaries for financial reporting, and Ethiopian date formatting.
 */

export const ETHIOPIAN_MONTHS = [
  { id: 1, name: "መስከረም", en: "Meskerem" },
  { id: 2, name: "ጥቅምት", en: "Tikimt" },
  { id: 3, name: "ኅዳር", en: "Hidar" },
  { id: 4, name: "ታኅሣሥ", en: "Tahsas" },
  { id: 5, name: "ጥር", en: "Tir" },
  { id: 6, name: "የካቲት", en: "Yekatit" },
  { id: 7, name: "መጋቢት", en: "Megabit" },
  { id: 8, name: "ሚያዝያ", en: "Miyazya" },
  { id: 9, name: "ግንቦት", en: "Ginbot" },
  { id: 10, name: "ሰኔ", en: "Sene" },
  { id: 11, name: "ሐምሌ", en: "Hamle" },
  { id: 12, name: "ነሐሴ", en: "Nehase" },
  { id: 13, name: "ጳጉሜ", en: "Pagume" },
] as const;

function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToEthiopian(jdn: number): { year: number; month: number; day: number } {
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor((jdn - 1723856) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

export function toEthiopian(date: Date | string): {
  year: number;
  month: number;
  day: number;
  monthName: string;
} {
  const d = typeof date === "string" ? new Date(date) : date;
  const jdn = gregorianToJDN(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const eth = jdnToEthiopian(jdn);
  const monthName =
    ETHIOPIAN_MONTHS.find((m) => m.id === eth.month)?.name ?? `ወር ${eth.month}`;
  return { ...eth, monthName };
}

function ethToJDN(year: number, month: number, day: number): number {
  return (
    1723856 +
    365 * year +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day -
    1
  );
}

function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

export function ethiopianToGregorian(
  ethYear: number,
  ethMonth: number,
  ethDay: number
): Date {
  const jdn = ethToJDN(ethYear, ethMonth, ethDay);
  const { year, month, day } = jdnToGregorian(jdn);
  return new Date(year, month - 1, day);
}

export function getEthiopianMonthRange(
  ethYear: number,
  ethMonth: number
): {
  startDate: Date;
  endDate: Date;
  startISO: string;
  endISO: string;
  ethYear: number;
  ethMonth: number;
  monthName: string;
  label: string;
} {
  const maxDays = ethMonth === 13 ? (ethYear % 4 === 3 ? 6 : 5) : 30;
  const startGreg = ethiopianToGregorian(ethYear, ethMonth, 1);
  const endGreg = ethiopianToGregorian(ethYear, ethMonth, maxDays);

  const startDate = new Date(
    startGreg.getFullYear(),
    startGreg.getMonth(),
    startGreg.getDate(),
    0,
    0,
    0,
    0
  );
  const endDate = new Date(
    endGreg.getFullYear(),
    endGreg.getMonth(),
    endGreg.getDate(),
    23,
    59,
    59,
    999
  );

  const monthObj = ETHIOPIAN_MONTHS.find((m) => m.id === ethMonth);
  const monthName = monthObj?.name ?? `ወር ${ethMonth}`;
  const label = `${monthName} ${ethYear} ዓ.ም`;

  return {
    startDate,
    endDate,
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
    ethYear,
    ethMonth,
    monthName,
    label,
  };
}

export function formatEthiopianDate(
  date: Date | string,
  includeTime = false
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const { year, day, monthName } = toEthiopian(d);
  let formatted = `${monthName} ${day} ቀን ${year} ዓ.ም`;

  if (includeTime) {
    const hours = d.getHours().toString().padStart(2, "0");
    const mins = d.getMinutes().toString().padStart(2, "0");
    formatted += ` (${hours}:${mins})`;
  }

  return formatted;
}

export function getCurrentEthiopianDate(): {
  year: number;
  month: number;
  day: number;
  monthName: string;
  formatted: string;
} {
  const now = new Date();
  const eth = toEthiopian(now);
  return {
    ...eth,
    formatted: `${eth.monthName} ${eth.day} ቀን ${eth.year} ዓ.ም`,
  };
}

/**
 * Returns options for the current and recent Ethiopian months (e.g. past 12 months)
 * for straightforward monthly profit navigation in dropdowns.
 */
export function getRecentEthiopianMonths(count = 12): Array<{
  ethYear: number;
  ethMonth: number;
  monthName: string;
  label: string;
  startISO: string;
  endISO: string;
}> {
  const current = getCurrentEthiopianDate();
  const list: Array<{
    ethYear: number;
    ethMonth: number;
    monthName: string;
    label: string;
    startISO: string;
    endISO: string;
  }> = [];

  let y = current.year;
  let m = current.month;

  for (let i = 0; i < count; i++) {
    const range = getEthiopianMonthRange(y, m);
    list.push({
      ethYear: y,
      ethMonth: m,
      monthName: range.monthName,
      label: range.label,
      startISO: range.startISO,
      endISO: range.endISO,
    });

    m -= 1;
    if (m < 1) {
      m = 13;
      y -= 1;
    }
  }

  return list;
}

export function getEthiopianDaysInMonth(year: number, month: number): number {
  if (month === 13) {
    return year % 4 === 3 ? 6 : 5;
  }
  return 30;
}

export function ethiopianRangeToGregorianISO(
  start: { year: number; month: number; day: number },
  end: { year: number; month: number; day: number }
): { startISO: string; endISO: string; label: string } {
  const startGreg = ethiopianToGregorian(start.year, start.month, start.day);
  const endGreg = ethiopianToGregorian(end.year, end.month, end.day);

  const startDate = new Date(
    startGreg.getFullYear(),
    startGreg.getMonth(),
    startGreg.getDate(),
    0,
    0,
    0,
    0
  );
  const endDate = new Date(
    endGreg.getFullYear(),
    endGreg.getMonth(),
    endGreg.getDate(),
    23,
    59,
    59,
    999
  );

  const startMonthName =
    ETHIOPIAN_MONTHS.find((m) => m.id === start.month)?.name ?? `ወር ${start.month}`;
  const endMonthName =
    ETHIOPIAN_MONTHS.find((m) => m.id === end.month)?.name ?? `ወር ${end.month}`;

  const label =
    start.year === end.year && start.month === end.month
      ? `${startMonthName} ${start.day} - ${end.day} ቀን ${start.year} ዓ.ም`
      : `${startMonthName} ${start.day}, ${start.year} - ${endMonthName} ${end.day}, ${end.year} ዓ.ም`;

  return {
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
    label,
  };
}
