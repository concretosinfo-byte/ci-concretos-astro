export const company = {
  name: 'CI CONCRETOS SAS',
  tagline: 'Concreto premezclado, obras civiles y estructuras metálicas',
  website: 'https://concretos-sas.com/',
  email: 'comercial@concretos-sas.com',
  phone: '+573178752705',
  phoneDisplay: '317 875 2705',
  whatsapp: '573178752705',
  location: 'Cali, Valle del Cauca, Colombia',
  coverage: 'Cobertura nacional',
  hours: 'Lunes a viernes 7:00 - 19:00 · Fines de semana 10:00 - 17:00',
} as const;

export const stats = [
  { value: '+500', label: 'Proyectos ejecutados' },
  { value: '+20', label: 'Años de experiencia' },
  { value: 'NTC', label: 'Certificación vigente' },
  { value: '8+', label: 'Ciudades coordinadas' },
] as const;

export const highlights = [
  {
    icon: 'time-outline',
    title: 'Suministro programado',
    text: 'Entregas parciales y volúmenes escalonados según el avance de obra.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Control de calidad',
    text: 'Diseño de mezcla validado por resistencia, asentamiento y fraguado.',
  },
  {
    icon: 'people-outline',
    title: 'Equipo técnico',
    text: 'Ingenieros y personal operativo especializado en obra estructural.',
  },
  {
    icon: 'map-outline',
    title: 'Cobertura nacional',
    text: 'Coordinación logística en las principales ciudades del país.',
  },
] as const;

export type Service = {
  slug: string;
  title: string;
  summary: string;
  details: string[];
};

export const services: Service[] = [
  {
    slug: 'concreto-premezclado',
    title: 'Concreto premezclado',
    summary: 'Suministro certificado NTC con entrega programada en obra.',
    details: [
      'Concretos convencionales, bombeables y de alta resistencia.',
      'Diseño de mezcla según resistencia, asentamiento y tiempos de fraguado.',
      'Programación de despachos por volumen, accesibilidad y capacidad de bombeo.',
      'Aplicaciones: cimentaciones, zapatas, placas, columnas, vigas y muros estructurales.',
    ],
  },
  {
    slug: 'estructuras-metalicas',
    title: 'Estructuras metálicas',
    summary: 'Diseño, fabricación e instalación para proyectos industriales y comerciales.',
    details: [
      'Naves industriales, bodegas, centros logísticos y edificaciones institucionales.',
      'Integración de sistemas metálicos con elementos estructurales en concreto.',
      'Montaje coordinado con el cronograma de vaciados.',
    ],
  },
  {
    slug: 'obras-civiles',
    title: 'Obras civiles',
    summary: 'Ejecución directa de movimientos de tierra, cimentaciones y urbanismo.',
    details: [
      'Movimientos de tierra y adecuación de terreno.',
      'Cimentaciones profundas y superficiales.',
      'Urbanismo y construcción estructural con control de tiempos y costos.',
    ],
  },
];

export const cities = [
  'Cali',
  'Bogotá',
  'Medellín',
  'Barranquilla',
  'Cartagena',
  'Manizales',
  'Pereira',
  'Armenia',
];

export const concreteTypes = [
  'Convencional',
  'Bombeable',
  'Alta resistencia',
  'No sé / requiero asesoría',
];

export const strengths = ['3000 PSI', '3500 PSI', '4000 PSI', '4500 PSI', '5000 PSI', 'Otra'];

export const faqs = [
  {
    question: '¿Pueden atender contratos de alto volumen?',
    answer:
      'Sí. Tenemos experiencia en contratos programados y suministro continuo para proyectos de mediana y gran escala.',
  },
  {
    question: '¿Atienden proyectos fuera de las principales ciudades?',
    answer:
      'Sí. Coordinamos suministro en cualquier ciudad o municipio según requerimiento del proyecto.',
  },
  {
    question: '¿Ofrecen acompañamiento técnico?',
    answer:
      'Sí. Coordinamos especificaciones estructurales y programación para garantizar cumplimiento en cada fase de la obra.',
  },
];
