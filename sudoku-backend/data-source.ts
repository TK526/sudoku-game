// sudoku-backend/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Temporarily load environment variables for CLI usage
// Note: This is a simplified way; more robust setups might exist
ConfigModule.forRoot({
    envFilePath: '.env', // Load .env if present for local CLI use
    ignoreEnvFile: process.env.NODE_ENV === 'production',
});
const configService = new ConfigService();

// Build the core options reusable by AppModule and CLI
export const typeOrmModuleOptions: DataSourceOptions = {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME', 'root'),
    password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_DATABASE', 'sudoku'), // DB name here
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'], // Example entity path
    migrations: [__dirname + '/src/migrations/*{.ts,.js}'], // <--- VERIFY/ADJUST THIS PATH
    synchronize: false,
    migrationsRun: false,
    logging: true, // Keep logging enabled for debugging
};

// Create the DataSource instance for the CLI
export const AppDataSource = new DataSource(typeOrmModuleOptions);

// *** IMPORTANT ***: Update AppModule to use typeOrmModuleOptions
// Go back to sudoku-backend/src/modules/app/app.module.ts and change
// TypeOrmModule.forRootAsync to use the imported options:
/*
import { typeOrmModuleOptions } from '../../data-source'; // Adjust path as needed
// ...
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Keep ConfigModule
    TypeOrmModule.forRoot(typeOrmModuleOptions), // Use the imported options directly
    GameModule,
    LeaderboardModule,
  ],
  // ...
})
export class AppModule {}
*/