import { Test, TestingModule } from '@nestjs/testing';
import { EntidadesBancariasController } from './entidades-bancarias.controller';
import { EntidadesBancariasService } from './entidades-bancarias.service';

describe('EntidadesBancariasController', () => {
  let controller: EntidadesBancariasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntidadesBancariasController],
      providers: [EntidadesBancariasService],
    }).compile();

    controller = module.get<EntidadesBancariasController>(EntidadesBancariasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
