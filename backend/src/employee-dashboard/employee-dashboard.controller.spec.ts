import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeDashboardController } from './employee-dashboard.controller';

describe('EmployeeDashboardController', () => {
  let controller: EmployeeDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeDashboardController],
    }).compile();

    controller = module.get<EmployeeDashboardController>(EmployeeDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
