import { Controller, Delete, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { TestingRepository } from './repositories/testing.repository';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly testingRepo: TestingRepository,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Delete('/testing/deleteAll')
  async deleteAll(): Promise<void> {
    await this.testingRepo.deleteAll();
  }
}
