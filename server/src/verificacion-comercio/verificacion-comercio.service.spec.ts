import { Test, TestingModule } from '@nestjs/testing';
import { VerificacionComercioService } from './verificacion-comercio.service';

describe('VerificacionComercioService', () => {
  let service: VerificacionComercioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificacionComercioService],
    }).compile();

    service = module.get<VerificacionComercioService>(VerificacionComercioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
