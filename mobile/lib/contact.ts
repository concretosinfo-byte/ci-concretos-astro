import { Linking } from 'react-native';

import { company } from '../constants/company';

export function openWhatsApp(message: string) {
  return Linking.openURL(`https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`);
}

export function callCompany() {
  return Linking.openURL(`tel:${company.phone}`);
}

export function emailCompany(subject: string, body = '') {
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return Linking.openURL(`mailto:${company.email}?${query}`);
}

export function openWebsite() {
  return Linking.openURL(company.website);
}
