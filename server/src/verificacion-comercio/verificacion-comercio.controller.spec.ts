import { Test, TestingModule } from '@nestjs/testing';
import { VerificacionComercioController } from './verificacion-comercio.controller';
import { VerificacionComercioService } from './verificacion-comercio.service';

describe('VerificacionComercioController', () => {
  let controller: VerificacionComercioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificacionComercioController],
      providers: [VerificacionComercioService],
    }).compile();

    controller = module.get<VerificacionComercioController>(VerificacionComercioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
