import type { ImageSourcePropType } from 'react-native';

export const media = {
  logo: require('../assets/images/logo.jpg') as ImageSourcePropType,
  hero: require('../assets/images/hero.jpg') as ImageSourcePropType,
  contact: require('../assets/images/contacto.jpg') as ImageSourcePropType,
};

export const serviceImages: Record<string, ImageSourcePropType> = {
  'concreto-premezclado': require('../assets/images/concreto-premezclado.jpg') as ImageSourcePropType,
  'estructuras-metalicas': require('../assets/images/estructuras-metalicas.jpg') as ImageSourcePropType,
  'obras-civiles': require('../assets/images/obras-civiles.jpg') as ImageSourcePropType,
};
