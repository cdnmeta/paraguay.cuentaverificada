import { Test, TestingModule } from '@nestjs/testing';
import { RecordatoriosService } from './recordatorios.service';

describe('RecordatoriosService', () => {
  let service: RecordatoriosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecordatoriosService],
    }).compile();

    service = module.get<RecordatoriosService>(RecordatoriosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
