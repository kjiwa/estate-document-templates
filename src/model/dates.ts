// Pure conversion between the stored three strings (`execution.executionDate`'s
// ordinal day / full month name / four-digit year) and an ISO `YYYY-MM-DD`
// value for a native `<input type="date">`. Deliberately avoids `new Date(iso)`
// (UTC-midnight parsing shifts the calendar day in negative-UTC-offset zones)
// and `toLocaleDateString` (locale-dependent month names in a legal document).

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface StoredExecutionDate {
  day: string;
  month: string;
  year: string;
}

function ordinalDayToNumber(day: string): number | null {
  const match = /^(\d{1,2})(st|nd|rd|th)$/.exec(day.trim());
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isInteger(value) || value < 1 || value > 31) return null;
  return value;
}

function monthNameToNumber(month: string): number | null {
  const index = MONTH_NAMES.findIndex(
    (name) => name.toLowerCase() === month.trim().toLowerCase()
  );
  return index === -1 ? null : index + 1;
}

export function toIsoDate({ day, month, year }: StoredExecutionDate): string {
  const dayNumber = ordinalDayToNumber(day);
  const monthNumber = monthNameToNumber(month);
  const yearMatch = /^\d{4}$/.exec(year.trim());
  if (dayNumber === null || monthNumber === null || !yearMatch) return "";
  const mm = String(monthNumber).padStart(2, "0");
  const dd = String(dayNumber).padStart(2, "0");
  return `${yearMatch[0]}-${mm}-${dd}`;
}

// 11th–13th are the exception to the 1st/2nd/3rd pattern; every other day
// takes the suffix matching its last digit.
function ordinalSuffix(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function fromIsoDate(iso: string): StoredExecutionDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return { day: "", month: "", year: "" };
  const [, yearStr, monthStr, dayStr] = match as unknown as [
    string,
    string,
    string,
    string,
  ];
  const monthNumber = Number(monthStr);
  const dayNumber = Number(dayStr);
  const monthName = MONTH_NAMES[monthNumber - 1];
  if (!monthName || dayNumber < 1 || dayNumber > 31) {
    return { day: "", month: "", year: "" };
  }
  return {
    day: `${dayNumber}${ordinalSuffix(dayNumber)}`,
    month: monthName,
    year: yearStr,
  };
}
