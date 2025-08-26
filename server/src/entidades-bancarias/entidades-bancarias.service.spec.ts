import { Test, TestingModule } from '@nestjs/testing';
import { EntidadesBancariasService } from './entidades-bancarias.service';

describe('EntidadesBancariasService', () => {
  let service: EntidadesBancariasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntidadesBancariasService],
    }).compile();

    service = module.get<EntidadesBancariasService>(EntidadesBancariasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
