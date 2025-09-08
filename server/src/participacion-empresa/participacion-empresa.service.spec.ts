import { Test, TestingModule } from '@nestjs/testing';
import { ParticipacionEmpresaService } from './participacion-empresa.service';

describe('ParticipacionEmpresaService', () => {
  let service: ParticipacionEmpresaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipacionEmpresaService],
    }).compile();

    service = module.get<ParticipacionEmpresaService>(ParticipacionEmpresaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
