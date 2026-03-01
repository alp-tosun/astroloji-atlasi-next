import { z } from 'zod';

const profileSchema = z
  .object({
    ad: z.string().max(100).optional(),
    cinsiyet: z.string().max(50).optional(),
    'dogum-tarih': z.string().max(20).optional(),
    'dogum-saat': z.string().max(20).optional(),
    'dogum-yer': z.string().max(100).optional(),
    burc: z.string().max(20).optional(),
    yukselen: z.string().max(20).optional(),
    'ay-burcu': z.string().max(20).optional(),
    'iliski-durumu': z.string().max(50).optional(),
  })
  .optional();

const uidField = z.string().optional();
const crossContextField = z.string().max(2000).optional().default('');

export const burcSchema = z.object({
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  customPrompt: z.string().max(2000).optional(),
  uid: uidField,
  crossContext: crossContextField,
});
export const gunlukSchema = z.object({
  burc: z.string().min(1, 'Burç gerekli.').max(20),
  odak: z.enum(['genel', 'ask', 'is', 'saglik', 'para']).optional().default('genel'),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});
export const uyumSchema = z.object({
  burc1: z.string().min(1, 'İki burç gerekli.').max(20),
  burc2: z.string().min(1, 'İki burç gerekli.').max(20),
  iliski: z.enum(['romantik', 'arkadaslik', 'is', 'aile']).optional().default('romantik'),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});
export const palmSchema = z.object({
  imageBase64: z.string().min(1, 'El fotoğrafı eksik.').max(7_000_000, 'Görsel çok büyük (max 5MB).'),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});
export const dreamSchema = z.object({
  metin: z.string().min(1, 'Rüya metni eksik.').max(2000),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});
export const numerologySchema = z.object({
  numbers: z.object({
    yasamYolu: z.number(),
    kader: z.number(),
    ruhArzu: z.number(),
    kisilik: z.number(),
  }),
  ad: z.string().min(1, 'Ad eksik.').max(100),
  tarih: z.string().optional().default(''),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});
export const horarySchema = z.object({
  soru: z.string().min(1, 'Soru eksik.').max(500),
  konu: z.enum(['ask', 'is', 'para', 'aile', 'egitim', 'saglik', 'diger']),
  sure: z.enum(['24s', '7g', '1ay', '3ay', '6ay']),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});
export const risingSchema = z.object({
  profil: profileSchema,
  eminlik: z.string().optional().default(''),
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});
export const moonSignSchema = z.object({
  profil: profileSchema,
  eminlik: z.string().optional().default(''),
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});
export const cosmicSchema = z.object({
  profil: profileSchema,
  tarih: z.string().optional(),
  gun: z.string().optional(),
  web_data: z.string().optional(),
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});

export const lunarSchema = z.object({
  date: z.string().max(20).optional(),
  phase: z.string().max(50).optional(),
  moonSign: z.string().max(20).optional(),
  illumination: z.number().optional(),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});

export const ritualSchema = z.object({
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});

export const dailyContentSchema = z.object({
  type: z.enum(['gunun-karti', 'haftalik', 'aylik']),
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  burc: z.string().max(20).optional().default(''),
  profil: profileSchema,
  uid: uidField,
});

export const tarotSchema = z.object({
  cards: z.array(
    z.object({
      name: z.string().min(1).max(100),
      position: z.string().min(1).max(50),
      meaning: z.string().max(200).optional(),
    }),
  ).min(1).max(3),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});

export const transitKisiselSchema = z.object({
  transitSummary: z.string().min(1, 'Transit verisi eksik.').max(3000),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});

export const yildizNameSchema = z.object({
  yildizSummary: z.string().min(1, 'Yıldızname verisi eksik.').max(2000),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});

export const kristalSchema = z.object({
  crystalSummary: z.string().min(1, 'Kristal verisi eksik.').max(2000),
  intention: z.string().max(50).optional().default('genel'),
  profil: profileSchema,
  lang: z.enum(['tr', 'en']).optional().default('tr'),
  uid: uidField,
  crossContext: crossContextField,
});

export const natalSchema = z.object({
  date: z.string().refine((d) => !isNaN(new Date(d).getTime()), 'Geçersiz tarih'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  place: z.string().optional(),
  houseSystem: z.enum(['placidus', 'whole-sign', 'equal']).default('whole-sign'),
});