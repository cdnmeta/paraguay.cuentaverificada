import { Test, TestingModule } from '@nestjs/testing';
import { PagoSuscripcionesService } from './pago-suscripciones.service';

describe('PagoSuscripcionesService', () => {
  let service: PagoSuscripcionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagoSuscripcionesService],
    }).compile();

    service = module.get<PagoSuscripcionesService>(PagoSuscripcionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
