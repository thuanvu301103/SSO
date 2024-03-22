import { Test, TestingModule } from '@nestjs/testing';
import { SamlController } from './saml.controller';

describe('SamlController', () => {
  let controller: SamlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SamlController],
    }).compile();

    controller = module.get<SamlController>(SamlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
