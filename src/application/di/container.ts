import { AIServiceImpl } from '@/infrastructure/ai/ai-service';
import { AnalysisRepositoryImpl } from '@/infrastructure/repositories/analysis-repository';
import { CacheRepositoryImpl } from '@/infrastructure/repositories/cache-repository';

import { BurcUseCase } from '@/application/use-cases/burc-use-case';
import { GunlukUseCase } from '@/application/use-cases/gunluk-use-case';
import { TarotUseCase } from '@/application/use-cases/tarot-use-case';
import { HoraryUseCase } from '@/application/use-cases/horary-use-case';
import { UyumUseCase } from '@/application/use-cases/uyum-use-case';
import { PalmUseCase } from '@/application/use-cases/palm-use-case';
import { DreamUseCase } from '@/application/use-cases/dream-use-case';
import { NumerologyUseCase } from '@/application/use-cases/numerology-use-case';
import { CosmicUseCase } from '@/application/use-cases/cosmic-use-case';
import { LunarUseCase } from '@/application/use-cases/lunar-use-case';
import { RisingUseCase } from '@/application/use-cases/rising-use-case';
import { MoonSignUseCase } from '@/application/use-cases/moon-sign-use-case';
import { DailyContentUseCase } from '@/application/use-cases/daily-content-use-case';
import { RitualUseCase } from '@/application/use-cases/ritual-use-case';
import { TransitKisiselUseCase } from '@/application/use-cases/transit-kisisel-use-case';
import { YildizNameUseCase } from '@/application/use-cases/yildizname-use-case';
import { KristalUseCase } from '@/application/use-cases/kristal-use-case';

// Infrastructure singletons
const aiService = new AIServiceImpl();
const analysisRepo = new AnalysisRepositoryImpl();
const cacheRepo = new CacheRepositoryImpl();

// Use case instances with injected dependencies
export const useCases = {
  burc: new BurcUseCase(aiService, analysisRepo, 'burc'),
  gunluk: new GunlukUseCase(aiService, analysisRepo, 'gunluk'),
  tarot: new TarotUseCase(aiService, analysisRepo, 'tarot'),
  horary: new HoraryUseCase(aiService, analysisRepo, 'horary'),
  uyum: new UyumUseCase(aiService, analysisRepo, 'uyum'),
  palm: new PalmUseCase(aiService, analysisRepo, 'el'),
  dream: new DreamUseCase(aiService, analysisRepo, 'ruya'),
  numerology: new NumerologyUseCase(aiService, analysisRepo, 'numeroloji'),
  cosmic: new CosmicUseCase(aiService, analysisRepo, 'cosmic'),
  lunar: new LunarUseCase(aiService, analysisRepo, 'lunar'),
  rising: new RisingUseCase(aiService, analysisRepo, 'rising'),
  moonSign: new MoonSignUseCase(aiService, analysisRepo, 'moon-sign'),
  dailyContent: new DailyContentUseCase(aiService, cacheRepo),
  ritual: new RitualUseCase(aiService, cacheRepo, analysisRepo, 'ritual'),
  transitKisisel: new TransitKisiselUseCase(aiService, analysisRepo, 'transit-kisisel'),
  yildizName: new YildizNameUseCase(aiService, analysisRepo, 'yildizname'),
  kristal: new KristalUseCase(aiService, analysisRepo, 'kristal'),
};
