export interface TimeSlot {
  label: string;
  start: string;
  end: string;
}

export const timeSlots: TimeSlot[] = [
  { label: '9am - 10am', start: '09:00', end: '10:00' },
  { label: '10am - 11am', start: '10:00', end: '11:00' },
  { label: '11am - 12pm', start: '11:00', end: '12:00' },
  { label: '12pm - 1pm', start: '12:00', end: '13:00' },
  { label: '1pm - 2pm', start: '13:00', end: '14:00' },
  { label: '2pm - 3pm', start: '14:00', end: '15:00' },
  { label: '3pm - 4pm', start: '15:00', end: '16:00' },
  { label: '4pm - 5pm', start: '16:00', end: '17:00' },
  { label: '5pm - 6pm', start: '17:00', end: '18:00' },
  { label: '6pm - 7pm', start: '18:00', end: '19:00' },
  { label: '7pm - 8pm', start: '19:00', end: '20:00' },
  { label: '8pm - 9pm', start: '20:00', end: '21:00' },
];

export const slotKey = (slot: Pick<TimeSlot, 'start' | 'end'>) => `${slot.start}-${slot.end}`;

export function getSlotKeysFromIndexes(startIndex: number, endIndex: number): string[] {
  if (startIndex < 0 || endIndex < 0 || startIndex >= timeSlots.length || endIndex >= timeSlots.length) {
    return [];
  }
  if (endIndex < startIndex) {
    return [];
  }
  return timeSlots.slice(startIndex, endIndex + 1).map(slotKey);
}

export function getSlotKeysFromTimes(startTime: string, endTime: string): string[] {
  const startIndex = timeSlots.findIndex((slot) => slot.start === startTime);
  const endIndex = timeSlots.findIndex((slot) => slot.end === endTime);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return [];
  }
  return getSlotKeysFromIndexes(startIndex, endIndex);
}

export function getAdditionalSlotKeys(currentEndTime: string, newEndTime: string): string[] {
  const currentIndex = timeSlots.findIndex((slot) => slot.end === currentEndTime);
  const newIndex = timeSlots.findIndex((slot) => slot.end === newEndTime);
  if (currentIndex === -1 || newIndex === -1 || newIndex <= currentIndex) {
    return [];
  }
  return getSlotKeysFromIndexes(currentIndex + 1, newIndex);
}

export function getSlotKeyByIndex(index: number): string | null {
  if (index < 0 || index >= timeSlots.length) {
    return null;
  }
  return slotKey(timeSlots[index]);
}
