/**
 * Generates a unique Login ID based on company code, employee name, year, and serial number
 * Format: [CompanyCode][FirstTwoLettersFirstName][FirstTwoLettersLastName][Year][SerialNumber]
 * Example: OIODO20220001
 */

export const generateLoginId = (
  companyCode: string,
  firstName: string,
  lastName: string,
  yearOfJoining: number,
  serialNumber: number
): string => {
  const companyCodeUpper = companyCode.toUpperCase().substring(0, 2);

  const firstNamePart = firstName
    .substring(0, 2)
    .toUpperCase()
    .padEnd(2, 'X');

  const lastNamePart = lastName
    .substring(0, 2)
    .toUpperCase()
    .padEnd(2, 'X');

  const serialPart = serialNumber.toString().padStart(4, '0');

  return `${companyCodeUpper}${firstNamePart}${lastNamePart}${yearOfJoining}${serialPart}`;
};

/**
 * Generates a random password for first-time login
 * Password format: 8 characters with uppercase, lowercase, numbers, and special chars
 */
export const generateRandomPassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$%&*';

  const allChars = uppercase + lowercase + numbers + special;

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Extracts company code from company name
 * Takes first letters of each word, max 2 characters
 */
export const extractCompanyCode = (companyName: string): string => {
  const words = companyName.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  const initials = words
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return initials;
};

/**
 * Gets the next serial number for a given year
 */
export const getNextSerialNumber = (
  existingEmployees: Array<{ yearOfJoining: number; serialNumber: number }>,
  year: number
): number => {
  const employeesInYear = existingEmployees.filter(
    emp => emp.yearOfJoining === year
  );

  if (employeesInYear.length === 0) {
    return 1;
  }

  const maxSerial = Math.max(
    ...employeesInYear.map(emp => emp.serialNumber)
  );

  return maxSerial + 1;
};
