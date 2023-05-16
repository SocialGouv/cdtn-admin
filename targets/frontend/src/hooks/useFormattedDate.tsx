import { useEffect, useState } from "react";

const useFormattedDate = (date: string) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => setFormattedDate(new Date(date).toLocaleString("fr-FR")), []);

  return formattedDate;
};

export default useFormattedDate;
