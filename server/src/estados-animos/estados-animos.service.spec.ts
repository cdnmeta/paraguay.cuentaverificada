import { Test, TestingModule } from '@nestjs/testing';
import { EstadosAnimosService } from './estados-animos.service';

describe('EstadosAnimosService', () => {
  let service: EstadosAnimosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadosAnimosService],
    }).compile();

    service = module.get<EstadosAnimosService>(EstadosAnimosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
