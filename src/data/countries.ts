export interface CountryInfo {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  dialCode: string;
  placeholder: string;
}

export const COUNTRIES_DATA: CountryInfo[] = [
  { code: 'PA', name: 'Panamá', nameEn: 'Panama', flag: '🇵🇦', dialCode: '+507', placeholder: '6000-0000' },
  { code: 'US', name: 'Estados Unidos', nameEn: 'United States', flag: '🇺🇸', dialCode: '+1', placeholder: '(555) 000-0000' },
  { code: 'CA', name: 'Canadá', nameEn: 'Canada', flag: '🇨🇦', dialCode: '+1', placeholder: '(555) 000-0000' },
  { code: 'CO', name: 'Colombia', nameEn: 'Colombia', flag: '🇨🇴', dialCode: '+57', placeholder: '300 000 0000' },
  { code: 'ES', name: 'España', nameEn: 'Spain', flag: '🇪🇸', dialCode: '+34', placeholder: '600 000 000' },
  { code: 'CR', name: 'Costa Rica', nameEn: 'Costa Rica', flag: '🇨🇷', dialCode: '+506', placeholder: '8000-0000' },
  { code: 'MX', name: 'México', nameEn: 'Mexico', flag: '🇲🇽', dialCode: '+52', placeholder: '55 0000 0000' },
  { code: 'DE', name: 'Alemania', nameEn: 'Germany', flag: '🇩🇪', dialCode: '+49', placeholder: '151 0000000' },
  { code: 'FR', name: 'Francia', nameEn: 'France', flag: '🇫🇷', dialCode: '+33', placeholder: '6 00 00 00 00' },
  { code: 'IT', name: 'Italia', nameEn: 'Italy', flag: '🇮🇹', dialCode: '+39', placeholder: '300 000 0000' },
  { code: 'GB', name: 'Reino Unido', nameEn: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', placeholder: '7911 123456' },
  { code: 'BR', name: 'Brasil', nameEn: 'Brazil', flag: '🇧🇷', dialCode: '+55', placeholder: '11 90000-0000' },
  { code: 'AR', name: 'Argentina', nameEn: 'Argentina', flag: '🇦🇷', dialCode: '+54', placeholder: '9 11 0000-0000' },
  { code: 'CL', name: 'Chile', nameEn: 'Chile', flag: '🇨🇱', dialCode: '+56', placeholder: '9 0000 0000' },
  { code: 'PE', name: 'Perú', nameEn: 'Peru', flag: '🇵🇪', dialCode: '+51', placeholder: '900 000 000' },
  { code: 'EC', name: 'Ecuador', nameEn: 'Ecuador', flag: '🇪🇨', dialCode: '+593', placeholder: '99 000 0000' },
  { code: 'UY', name: 'Uruguay', nameEn: 'Uruguay', flag: '🇺🇾', dialCode: '+598', placeholder: '99 000 000' },
  { code: 'PY', name: 'Paraguay', nameEn: 'Paraguay', flag: '🇵🇾', dialCode: '+595', placeholder: '981 000 000' },
  { code: 'BO', name: 'Bolivia', nameEn: 'Bolivia', flag: '🇧🇴', dialCode: '+591', placeholder: '7000 0000' },
  { code: 'VE', name: 'Venezuela', nameEn: 'Venezuela', flag: '🇻🇪', dialCode: '+58', placeholder: '412 000 0000' },
  { code: 'GT', name: 'Guatemala', nameEn: 'Guatemala', flag: '🇬🇹', dialCode: '+502', placeholder: '5000 0000' },
  { code: 'HN', name: 'Honduras', nameEn: 'Honduras', flag: '🇭🇳', dialCode: '+504', placeholder: '9000 0000' },
  { code: 'SV', name: 'El Salvador', nameEn: 'El Salvador', flag: '🇸🇻', dialCode: '+503', placeholder: '7000 0000' },
  { code: 'NI', name: 'Nicaragua', nameEn: 'Nicaragua', flag: '🇳🇮', dialCode: '+505', placeholder: '8000 0000' },
  { code: 'DO', name: 'República Dominicana', nameEn: 'Dominican Republic', flag: '🇩🇴', dialCode: '+1-809', placeholder: '809 000 0000' },
  { code: 'PR', name: 'Puerto Rico', nameEn: 'Puerto Rico', flag: '🇵🇷', dialCode: '+1-787', placeholder: '787 000 0000' },
  { code: 'CH', name: 'Suiza', nameEn: 'Switzerland', flag: '🇨🇭', dialCode: '+41', placeholder: '79 000 00 00' },
  { code: 'NL', name: 'Países Bajos', nameEn: 'Netherlands', flag: '🇳🇱', dialCode: '+31', placeholder: '6 00000000' },
  { code: 'BE', name: 'Bélgica', nameEn: 'Belgium', flag: '🇧🇪', dialCode: '+32', placeholder: '470 00 00 00' },
  { code: 'PT', name: 'Portugal', nameEn: 'Portugal', flag: '🇵🇹', dialCode: '+351', placeholder: '910 000 000' },
  { code: 'SE', name: 'Suecia', nameEn: 'Sweden', flag: '🇸🇪', dialCode: '+46', placeholder: '70 000 00 00' },
  { code: 'NO', name: 'Noruega', nameEn: 'Norway', flag: '🇳🇴', dialCode: '+47', placeholder: '900 00 000' },
  { code: 'DK', name: 'Dinamarca', nameEn: 'Denmark', flag: '🇩🇰', dialCode: '+45', placeholder: '20 00 00 00' },
  { code: 'FI', name: 'Finlandia', nameEn: 'Finland', flag: '🇫🇮', dialCode: '+358', placeholder: '40 0000000' },
  { code: 'PL', name: 'Polonia', nameEn: 'Poland', flag: '🇵🇱', dialCode: '+48', placeholder: '500 000 000' },
  { code: 'AT', name: 'Austria', nameEn: 'Austria', flag: '🇦🇹', dialCode: '+43', placeholder: '664 000000' },
  { code: 'IE', name: 'Irlanda', nameEn: 'Ireland', flag: '🇮🇪', dialCode: '+353', placeholder: '85 000 0000' },
  { code: 'AU', name: 'Australia', nameEn: 'Australia', flag: '🇦🇺', dialCode: '+61', placeholder: '400 000 000' },
  { code: 'NZ', name: 'Nueva Zelanda', nameEn: 'New Zealand', flag: '🇳🇿', dialCode: '+64', placeholder: '21 000 0000' },
  { code: 'IL', name: 'Israel', nameEn: 'Israel', flag: '🇮🇱', dialCode: '+972', placeholder: '50 000 0000' },
  { code: 'JP', name: 'Japón', nameEn: 'Japan', flag: '🇯🇵', dialCode: '+81', placeholder: '90 0000 0000' },
  { code: 'KR', name: 'Corea del Sur', nameEn: 'South Korea', flag: '🇰🇷', dialCode: '+82', placeholder: '10 0000 0000' },
  { code: 'CN', name: 'China', nameEn: 'China', flag: '🇨🇳', dialCode: '+86', placeholder: '138 0000 0000' },
  { code: 'IN', name: 'India', nameEn: 'India', flag: '🇮🇳', dialCode: '+91', placeholder: '98000 00000' },
  { code: 'RU', name: 'Rusia', nameEn: 'Russia', flag: '🇷🇺', dialCode: '+7', placeholder: '900 000-00-00' },
  { code: 'TR', name: 'Turquía', nameEn: 'Turkey', flag: '🇹🇷', dialCode: '+90', placeholder: '500 000 0000' },
  { code: 'AE', name: 'Emiratos Árabes', nameEn: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', placeholder: '50 000 0000' },
  { code: 'ZA', name: 'Sudáfrica', nameEn: 'South Africa', flag: '🇿🇦', dialCode: '+27', placeholder: '82 000 0000' },
  { code: 'OT', name: 'Otro País', nameEn: 'Other Country', flag: '🌎', dialCode: '+', placeholder: 'Código + Número' },
];

export function findCountryByNameOrCode(searchTerm: string): CountryInfo {
  if (!searchTerm) return COUNTRIES_DATA[0];
  const clean = searchTerm.trim().toLowerCase();
  const found = COUNTRIES_DATA.find(
    (c) =>
      c.name.toLowerCase() === clean ||
      c.nameEn.toLowerCase() === clean ||
      c.code.toLowerCase() === clean ||
      c.dialCode.replace(/\D/g, '') === clean.replace(/\D/g, '')
  );
  return found || COUNTRIES_DATA[0];
}
