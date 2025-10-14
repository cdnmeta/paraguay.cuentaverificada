import { Test, TestingModule } from '@nestjs/testing';
import { EstadosAnimosController } from './estados-animos.controller';
import { EstadosAnimosService } from './estados-animos.service';

describe('EstadosAnimosController', () => {
  let controller: EstadosAnimosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadosAnimosController],
      providers: [EstadosAnimosService],
    }).compile();

    controller = module.get<EstadosAnimosController>(EstadosAnimosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
