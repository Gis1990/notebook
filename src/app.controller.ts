import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AppService } from './app.service';
import { TestingRepository } from './repositories/testing.repository';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  ApiDropDatabase,
  GetUserFromDatabaseTest,
} from '../documentation/swagger/auth.documentation';

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
  @Get('testing/users/:data')
  @HttpCode(HttpStatus.OK)
  @GetUserFromDatabaseTest()
  async getUserTest(@Param('data') data: string) {
    return await this.testingRepo.getUser(data);
  }
}
