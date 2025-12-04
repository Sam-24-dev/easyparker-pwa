export function getAvailabilityByHour(
  totalSpaces: number,
  currentHour: number = new Date().getHours()
): number {
  // Horarios pico (8-10am, 12-2pm, 6-8pm)
  const isPeakMorning = currentHour >= 8 && currentHour < 10;
  const isPeakNoon = currentHour >= 12 && currentHour < 14;
  const isPeakEvening = currentHour >= 18 && currentHour < 20;
  
  const isPeakHour = isPeakMorning || isPeakNoon || isPeakEvening;
  
  if (isPeakHour) {
    // 70-85% ocupado en horas pico
    const occupancyRate = 0.70 + Math.random() * 0.15;
    return Math.max(1, Math.floor(totalSpaces * (1 - occupancyRate)));
  }
  
  // Horas valle (11pm-6am)
  if (currentHour >= 23 || currentHour < 6) {
    // 10-30% ocupado en madrugada
    const occupancyRate = 0.10 + Math.random() * 0.20;
    return Math.floor(totalSpaces * (1 - occupancyRate));
  }
  
  // Horas normales
  // 40-60% ocupado
  const occupancyRate = 0.40 + Math.random() * 0.20;
  return Math.floor(totalSpaces * (1 - occupancyRate));
}

export function getAvailabilityColor(available: number, total: number): 'green' | 'yellow' | 'red' {
  const percentage = (available / total) * 100;
  
  if (percentage > 30) return 'green';
  if (percentage > 10) return 'yellow';
  return 'red';
}
