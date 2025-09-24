import { Test, TestingModule } from '@nestjs/testing';
import { VendedoresEmpresaService } from './vendedores-empresa.service';

describe('VendedoresEmpresaService', () => {
  let service: VendedoresEmpresaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendedoresEmpresaService],
    }).compile();

    service = module.get<VendedoresEmpresaService>(VendedoresEmpresaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
