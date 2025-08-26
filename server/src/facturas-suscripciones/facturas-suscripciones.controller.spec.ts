import { Test, TestingModule } from '@nestjs/testing';
import { FacturasSuscripcionesController } from './facturas-suscripciones.controller';
import { FacturasSuscripcionesService } from './facturas-suscripciones.service';

describe('FacturasSuscripcionesController', () => {
  let controller: FacturasSuscripcionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturasSuscripcionesController],
      providers: [FacturasSuscripcionesService],
    }).compile();

    controller = module.get<FacturasSuscripcionesController>(FacturasSuscripcionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
