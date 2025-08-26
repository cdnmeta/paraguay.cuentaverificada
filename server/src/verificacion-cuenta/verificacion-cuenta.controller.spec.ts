import { Test, TestingModule } from '@nestjs/testing';
import { VerificacionCuentaController } from './verificacion-cuenta.controller';
import { VerificacionCuentaService } from './verificacion-cuenta.service';

describe('VerificacionCuentaController', () => {
  let controller: VerificacionCuentaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificacionCuentaController],
      providers: [VerificacionCuentaService],
    }).compile();

    controller = module.get<VerificacionCuentaController>(VerificacionCuentaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
