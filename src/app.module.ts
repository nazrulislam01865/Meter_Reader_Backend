import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';

import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5433),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'meter_reader'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',

      }),
    }),
    AdminModule,
    UsersModule,
    AuthModule

  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



    // }),
    //   TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5433,
    //   username: 'postgres',
    //   password: 'Shuvessa',
    //   database: 'meter_reader',
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),