import { Test, TestingModule } from '@nestjs/testing';
import { CotizacionEmpresaService } from './cotizacion-empresa.service';

describe('CotizacionEmpresaService', () => {
  let service: CotizacionEmpresaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CotizacionEmpresaService],
    }).compile();

    service = module.get<CotizacionEmpresaService>(CotizacionEmpresaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
