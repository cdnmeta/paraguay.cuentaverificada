import { Test, TestingModule } from '@nestjs/testing';
import { SoporteService } from './soporte.service';

describe('SoporteService', () => {
  let service: SoporteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoporteService],
    }).compile();

    service = module.get<SoporteService>(SoporteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
