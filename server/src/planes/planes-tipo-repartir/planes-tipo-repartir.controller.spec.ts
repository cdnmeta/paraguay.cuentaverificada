import { Test, TestingModule } from '@nestjs/testing';
import { PlanesTipoRepartirController } from './planes-tipo-repartir.controller';

describe('PlanesTipoRepartirController', () => {
  let controller: PlanesTipoRepartirController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanesTipoRepartirController],
    }).compile();

    controller = module.get<PlanesTipoRepartirController>(PlanesTipoRepartirController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
