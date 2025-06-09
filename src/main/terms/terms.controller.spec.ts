import { Test, TestingModule } from '@nestjs/testing';
import { TermsController } from './terms.controller';

describe('TermsController', () => {
  let controller: TermsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TermsController],
    }).compile();

    controller = module.get<TermsController>(TermsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
