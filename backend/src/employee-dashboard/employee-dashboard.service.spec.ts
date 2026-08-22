import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeDashboardService } from './employee-dashboard.service';

describe('EmployeeDashboardService', () => {
  let service: EmployeeDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeDashboardService],
    }).compile();

    service = module.get<EmployeeDashboardService>(EmployeeDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
