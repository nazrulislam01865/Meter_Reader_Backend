import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
    }),
      TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'Shuvessa',
      database: 'meter_reader',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AdminModule,

  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
