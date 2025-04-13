// sudoku-backend/src/modules/app/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from '../game/game.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule

@Module({
  imports: [
    // --- Add ConfigModule ---
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigService available globally
      envFilePath: '.env', // Optional: specify .env file if you use one locally
      ignoreEnvFile: process.env.NODE_ENV === 'production', // Ignore .env in production (use system env vars)
    }),
    // --- Modify TypeOrmModule ---
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule here
      inject: [ConfigService], // Inject ConfigService
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        // Read from environment variables, provide defaults for local development
        host: configService.get<string>('DB_HOST', 'localhost'), // Read DB_HOST env var
        port: configService.get<number>('DB_PORT', 3306), // Read DB_PORT env var
        username: configService.get<string>('DB_USERNAME', 'root'), // Read DB_USERNAME env var
        password: configService.get<string>('DB_PASSWORD', ''), // Read DB_PASSWORD env var (Provide default if needed)
        database: configService.get<string>('DB_DATABASE', 'sudoku'), // Read DB_DATABASE env var
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('DB_SYNC', true), // Use synchronize only for dev, disable in prod via env var
        // Production settings (consider migrations instead of synchronize: true)
        // migrationsRun: process.env.NODE_ENV === 'production',
        // migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      }),
    }),
    GameModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}