import { Test, TestingModule } from '@nestjs/testing';
import { VerificacionCuentaService } from './verificacion-cuenta.service';

describe('VerificacionCuentaService', () => {
  let service: VerificacionCuentaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificacionCuentaService],
    }).compile();

    service = module.get<VerificacionCuentaService>(VerificacionCuentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
