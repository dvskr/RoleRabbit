export const MONTHS = Array.from({ length: 12 }, (_, i) => 
  String(i + 1).padStart(2, '0')
);

export const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear + i);
};

