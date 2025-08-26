import { Test, TestingModule } from '@nestjs/testing';
import { MonedasController } from './monedas.controller';
import { MonedasService } from './monedas.service';

describe('MonedasController', () => {
  let controller: MonedasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonedasController],
      providers: [MonedasService],
    }).compile();

    controller = module.get<MonedasController>(MonedasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
