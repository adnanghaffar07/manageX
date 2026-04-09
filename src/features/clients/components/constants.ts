import { all } from 'country-codes-list';

// Helper to convert ISO code to flag emoji
export const getFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const COUNTRIES = all().map(c => ({
  code: c.countryCode,
  name: c.countryNameEn,
  dialCode: c.countryCallingCode ? `+${c.countryCallingCode.replace('+', '')}` : '',
  flag: getFlagEmoji(c.countryCode)
})).sort((a, b) => a.name.localeCompare(b.name));

const currencyMap = new Map<string, { code: string, name: string }>();
all().forEach(c => {
  if (c.currencyCode) {
    const codes = c.currencyCode.split(',');
    const names = (c.currencyNameEn || '').split(',');
    codes.forEach((code, i) => {
      const trimmedCode = code.trim();
      if (trimmedCode && !currencyMap.has(trimmedCode)) {
        currencyMap.set(trimmedCode, {
          code: trimmedCode,
          name: names[i] ? names[i].trim() : trimmedCode
        });
      }
    });
  }
});
export const CURRENCIES = Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code));
