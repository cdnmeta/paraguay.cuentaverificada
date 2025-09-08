import { Test, TestingModule } from '@nestjs/testing';
import { ParticipacionEmpresaController } from './participacion-empresa.controller';
import { ParticipacionEmpresaService } from './participacion-empresa.service';

describe('ParticipacionEmpresaController', () => {
  let controller: ParticipacionEmpresaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipacionEmpresaController],
      providers: [ParticipacionEmpresaService],
    }).compile();

    controller = module.get<ParticipacionEmpresaController>(ParticipacionEmpresaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
