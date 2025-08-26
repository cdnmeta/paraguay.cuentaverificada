import { Test, TestingModule } from '@nestjs/testing';
import { PagoSuscripcionesController } from './pago-suscripciones.controller';
import { PagoSuscripcionesService } from './pago-suscripciones.service';

describe('PagoSuscripcionesController', () => {
  let controller: PagoSuscripcionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagoSuscripcionesController],
      providers: [PagoSuscripcionesService],
    }).compile();

    controller = module.get<PagoSuscripcionesController>(PagoSuscripcionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
