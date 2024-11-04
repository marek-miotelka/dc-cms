import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategyController } from './local.controller';

describe('LocalStrategyController', () => {
  let controller: LocalStrategyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalStrategyController],
    }).compile();

    controller = module.get<LocalStrategyController>(LocalStrategyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
