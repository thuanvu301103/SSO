import { Test, TestingModule } from '@nestjs/testing';
import { SamlService } from './saml.service';

describe('SamlService', () => {
  let service: SamlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SamlService],
    }).compile();

    service = module.get<SamlService>(SamlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
