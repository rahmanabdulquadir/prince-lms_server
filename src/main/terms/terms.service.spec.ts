import { Test, TestingModule } from '@nestjs/testing';
import { TermsService } from './terms.service';

describe('TermsService', () => {
  let service: TermsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TermsService],
    }).compile();

    service = module.get<TermsService>(TermsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
