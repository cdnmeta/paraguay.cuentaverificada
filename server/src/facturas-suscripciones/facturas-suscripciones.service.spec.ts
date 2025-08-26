import { Test, TestingModule } from '@nestjs/testing';
import { FacturasSuscripcionesService } from './facturas-suscripciones.service';

describe('FacturasSuscripcionesService', () => {
  let service: FacturasSuscripcionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacturasSuscripcionesService],
    }).compile();

    service = module.get<FacturasSuscripcionesService>(FacturasSuscripcionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
