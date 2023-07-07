import { Controller, Delete, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { TestingRepository } from './repositories/testing.repository';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ApiDropDatabase } from '../documentation/swagger/auth.documentation';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly testingRepo: TestingRepository,
  ) {}

  @Get()
  @ApiExcludeEndpoint()
  getHello(): string {
    return this.appService.getHello();
  }
  @Delete('/testing/deleteAll')
  @ApiDropDatabase()
  async deleteAll(): Promise<void> {
    await this.testingRepo.deleteAll();
  }
}
