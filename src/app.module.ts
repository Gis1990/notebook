import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ConfigModule } from '@nestjs/config';
import { TestingRepository } from './repositories/testing.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService, TestingRepository, PrismaService],
})
export class AppModule {}
