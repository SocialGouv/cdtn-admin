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
  const pad = (num: number) => (num < 10 ? "0" : "") + num;
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}
