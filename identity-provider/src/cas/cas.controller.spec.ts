import { Test, TestingModule } from '@nestjs/testing';
import { CasController } from './cas.controller';

describe('CasController', () => {
  let controller: CasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasController],
    }).compile();

    controller = module.get<CasController>(CasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
