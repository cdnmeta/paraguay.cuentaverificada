import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudesRecargaService } from './solicitudes-recarga.service';

describe('SolicitudesRecargaService', () => {
  let service: SolicitudesRecargaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudesRecargaService],
    }).compile();

    service = module.get<SolicitudesRecargaService>(SolicitudesRecargaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
