/**
 * Date and Time Utilities for Chronicle
 * Zero external dependency, robust, and timezone safe
 */

export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // safe noon time
}

export function getTodayString(): string {
  return toDateString(new Date());
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);
  
  if (hours === 0) return `${remainingMins}m`;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

export function formatTimeDisplay(timeStr: string, is24Hour: boolean = true): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let hours = parseInt(hStr, 10);
  const minutes = mStr || '00';

  if (is24Hour) {
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}

export function formatDateDisplay(dateStr: string, formatType: 'full' | 'short' | 'month-day' = 'full'): string {
  if (!dateStr) return '';
  const date = parseDateString(dateStr);
  const today = getTodayString();
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  if (formatType === 'full') {
    if (dateStr === today) return 'Today, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dateStr === yesterday) return 'Yesterday, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (formatType === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  // Handle overnight activities (e.g., 23:00 to 01:00)
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return Math.max(0, endMinutes - startMinutes);
}

export function addMinutesToTime(startTime: string, minutes: number): string {
  if (!startTime) return '01:00';
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = (h * 60 + m + minutes) % (24 * 60);
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

export function getWeekDays(referenceDate: Date, startOnMonday: boolean = true): Date[] {
  const current = new Date(referenceDate);
  const day = current.getDay(); // 0 = Sunday, 1 = Monday
  
  let diff = current.getDate() - day;
  if (startOnMonday) {
    diff += (day === 0 ? -6 : 1);
  }

  const startOfWeek = new Date(current.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(startOfWeek);
    nextDay.setDate(startOfWeek.getDate() + i);
    days.push(nextDay);
  }
  return days;
}

export function getMonthGrid(year: number, month: number, startOnMonday: boolean = true): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  let firstDayIndex = firstDay.getDay(); // 0 = Sunday
  if (startOnMonday) {
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  }

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  // Pad previous month days as null
  for (let i = 0; i < firstDayIndex; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isDateInThisWeek(dateStr: string, startOnMonday: boolean = true): boolean {
  const target = parseDateString(dateStr);
  const week = getWeekDays(new Date(), startOnMonday);
  const start = week[0];
  const end = week[6];
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return target >= start && target <= end;
}

export function isDateInThisMonth(dateStr: string): boolean {
  const target = parseDateString(dateStr);
  const now = new Date();
  return target.getFullYear() === now.getFullYear() && target.getMonth() === now.getMonth();
}
