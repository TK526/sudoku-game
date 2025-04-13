// sudoku-backend/src/modules/app/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from '../game/game.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Keep ConfigModule import

// --- IMPORT the shared TypeORM configuration ---
// Adjust the relative path based on your project structure
import { typeOrmModuleOptions } from '../../../data-source'; // e.g., ../../../data-source if data-source.ts is in the root

@Module({
  imports: [
    // --- Keep ConfigModule (needs to run before TypeOrmModule uses ConfigService via data-source.ts) ---
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    // --- Use TypeOrmModule.forRoot with the imported options ---
    // This replaces TypeOrmModule.forRootAsync
    TypeOrmModule.forRoot(typeOrmModuleOptions),

    // --- Other application modules ---
    GameModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}