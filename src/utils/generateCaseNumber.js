export const generateCaseNumber = (index) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = String(index).padStart(3, '0');
  return `${year}/${month}/${count}`;
};
