import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('upcoming')
  getUpcoming(@Query('limit') limit?: string) {
    return this.dashboardService.getUpcoming(limit ? parseInt(limit) : 5);
  }

  @Get('recent')
  getRecent(@Query('limit') limit?: string) {
    return this.dashboardService.getRecent(limit ? parseInt(limit) : 5);
  }
}
