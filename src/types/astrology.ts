export const ZODIAC_SIGNS_TR = [
  'Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak',
  'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık',
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS_TR)[number];

export const ELEMENT_GROUPS: Record<string, ZodiacSign[]> = {
  ates: ['Koç', 'Aslan', 'Yay'],
  toprak: ['Boğa', 'Başak', 'Oğlak'],
  hava: ['İkizler', 'Terazi', 'Kova'],
  su: ['Yengeç', 'Akrep', 'Balık'],
};

export const ZODIAC_DESCRIPTIONS: Record<ZodiacSign, string> = {
  'Koç': 'Koç burcu olarak doğal bir lider ve öncüsün. Ateş elementi sana cesaret, kararlılık ve güçlü bir irade bahşetmiş.',
  'Boğa': 'Boğa burcu olarak güvenilirliğin ve kararlılığın sembolüsün. Toprak elementi sana pratik bir zeka, sabır ve güzelliğe derin bir bağlılık vermiş.',
  'İkizler': 'İkizler burcu olarak zihmin hiç durmayan bir makinedir. Hava elementi sana hızlı düşünme, merak ve üstün iletişim yeteneği kazandırmış.',
  'Yengeç': 'Yengeç burcu olarak derin bir sezgi ve duygusal zeka taşırsın. Su elementi sana empati, koruyuculuk ve güçlü bir aile bağı vermiş.',
  'Aslan': 'Aslan burcu olarak sahneye çıktığında tüm gözler üzerine çevrilir. Ateş elementi sana yaratıcılık, cömertlik ve karizmatik bir enerji vermiş.',
  'Başak': 'Başak burcu olarak ayrıntılara verdiğin önem ve analitik zekan benzersizdir. Toprak elementi sana pratik bir yaklaşım kazandırmış.',
  'Terazi': 'Terazi burcu olarak denge ve adalet özündedir. Hava elementi sana diplomatik bakış, estetik zevk kazandırmış.',
  'Akrep': 'Akrep burcu olarak derinliklere inme ve gizemi çözme yeteneğin eşsizdir. Su elementi sana yoğun duygular vermiş.',
  'Yay': 'Yay burcu olarak özgürlük ve keşif ruhun hiç sönmez. Ateş elementi sana iyimserlik ve maceraya açlık vermiş.',
  'Oğlak': 'Oğlak burcu olarak hedeflerine olan bağlılığın ve disiplinin seni diğerlerinden ayırır.',
  'Kova': 'Kova burcu olarak yenilikçi düşüncen ve insanlığa olan bağlılığın öne çıkar.',
  'Balık': 'Balık burcu olarak hayal gücün ve ruhsal derinliğin seni evrende özel bir yere koyar.',
};

export const RISING_DESCRIPTIONS: Record<ZodiacSign, string> = {
  'Koç': 'Enerjik, doğrudan ve cesur bir ilk izlenim bırakırsın. İnsanlar seni güçlü ve kararlı olarak algılar.',
  'Boğa': 'Sakin, güvenilir ve estetik bir aura yayarsın. İnsanlar seni istikrarlı ve hoş biri olarak görür.',
  'İkizler': 'Zeki, meraklı ve konuşkan bir imaj çizersin. İnsanlar seni eğlenceli ve uyumlu bulur.',
  'Yengeç': 'Sıcak, koruyucu ve duygusal bir aura taşırsın. İnsanlar seni şefkatli ve anlayışlı görür.',
  'Aslan': 'Karizmatik, özgüvenli ve dikkat çekici bir ilk izlenim yaratırsın. İnsanlar sende doğal bir liderlik görür.',
  'Başak': 'Düzenli, analitik ve güvenilir bir imaj yansıtırsın. İnsanlar seni titiz ve dürüst biri olarak tanır.',
  'Terazi': 'Zarif, diplomatik ve dengeli bir aura yayarsın. İnsanlar seni uyumlu ve adil biri olarak görür.',
  'Akrep': 'Gizemli, yoğun ve etkileyici bir ilk izlenim bırakırsın. İnsanlar sende derin bir güç hisseder.',
  'Yay': 'Coşkulu, özgür ruhlu ve iyimser bir enerji taşırsın. İnsanlar seni maceraperest ve ilham verici bulur.',
  'Oğlak': 'Ciddi, disiplinli ve güvenilir bir aura yayarsın. İnsanlar seni başarıya adanmış biri olarak görür.',
  'Kova': 'Özgün, yenilikçi ve bağımsız bir imaj çizersin. İnsanlar sende farklı bir bakış açısı fark eder.',
  'Balık': 'Yumuşak, sezgisel ve rüyamsı bir aura taşırsın. İnsanlar seni anlayışlı ve yaratıcı biri olarak görür.',
};
