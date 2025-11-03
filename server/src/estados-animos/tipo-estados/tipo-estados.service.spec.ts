import { Test, TestingModule } from '@nestjs/testing';
import { TipoEstadosService } from './tipo-estados.service';

describe('TipoEstadosService', () => {
  let service: TipoEstadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoEstadosService],
    }).compile();

    service = module.get<TipoEstadosService>(TipoEstadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
