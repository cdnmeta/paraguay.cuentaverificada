import { Test, TestingModule } from '@nestjs/testing';
import { SemaforoFinancieroController } from './semaforo_financiero.controller';
import { SemaforoFinancieroService } from './semaforo_financiero.service';

describe('SemaforoFinancieroController', () => {
  let controller: SemaforoFinancieroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SemaforoFinancieroController],
      providers: [SemaforoFinancieroService],
    }).compile();

    controller = module.get<SemaforoFinancieroController>(SemaforoFinancieroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
