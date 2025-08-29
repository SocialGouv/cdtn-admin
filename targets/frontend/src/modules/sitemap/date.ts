export const transformStringDate = (date: string): Date => {
  const isFrenchDate = date.match(/^\d{2}\/\d{2}\/\d{4}$/);
  if (isFrenchDate) {
    const [day, month, year] = date.split("/");
    return new Date(`${year}-${month}-${day}`);
  } else {
    return new Date(date);
  }
};

export function formatDateToCustomISO(date: Date): string {
  return date.toISOString();
}
