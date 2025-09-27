import { Test, TestingModule } from '@nestjs/testing';
import { SemaforoFinancieroService } from './semaforo_financiero.service';

describe('SemaforoFinancieroService', () => {
  let service: SemaforoFinancieroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SemaforoFinancieroService],
    }).compile();

    service = module.get<SemaforoFinancieroService>(SemaforoFinancieroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
