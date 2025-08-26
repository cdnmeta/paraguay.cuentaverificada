import { Test, TestingModule } from '@nestjs/testing';
import { CotizacionEmpresaController } from './cotizacion-empresa.controller';
import { CotizacionEmpresaService } from './cotizacion-empresa.service';

describe('CotizacionEmpresaController', () => {
  let controller: CotizacionEmpresaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CotizacionEmpresaController],
      providers: [CotizacionEmpresaService],
    }).compile();

    controller = module.get<CotizacionEmpresaController>(CotizacionEmpresaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
