"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.typeOrmModuleOptions = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
config_1.ConfigModule.forRoot({
    envFilePath: '.env',
    ignoreEnvFile: process.env.NODE_ENV === 'production',
});
const configService = new config_1.ConfigService();
exports.typeOrmModuleOptions = {
    type: 'mysql',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 3306),
    username: configService.get('DB_USERNAME', 'root'),
    password: configService.get('DB_PASSWORD', ''),
    database: configService.get('DB_DATABASE', 'sudoku'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    migrationsRun: false,
    logging: configService.get('NODE_ENV') !== 'production',
};
exports.AppDataSource = new typeorm_1.DataSource(exports.typeOrmModuleOptions);
//# sourceMappingURL=data-source.js.map