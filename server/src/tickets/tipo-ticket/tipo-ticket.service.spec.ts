import { Test, TestingModule } from '@nestjs/testing';
import { TipoTicketService } from './tipo-ticket.service';

describe('TipoTicketService', () => {
  let service: TipoTicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoTicketService],
    }).compile();

    service = module.get<TipoTicketService>(TipoTicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
