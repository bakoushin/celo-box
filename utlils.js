export const cleanNumber = (str) => Number(str.replace(',', '.'));

export const validAmount = (amount) =>
  !Number.isNaN(cleanNumber(amount)) && cleanNumber(amount) > 0;
