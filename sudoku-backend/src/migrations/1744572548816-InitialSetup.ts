import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSetup1744572548816 implements MigrationInterface {
    name = 'InitialSetup1744572548816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`record\` (\`id\` varchar(36) NOT NULL, \`username\` varchar(255) NOT NULL, \`score\` int NOT NULL, \`difficulty\` varchar(255) NOT NULL, \`completedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`game\` (\`id\` varchar(36) NOT NULL, \`grid\` text NOT NULL, \`currentGrid\` text NOT NULL, \`visibleValuesCount\` int NOT NULL, \`errors\` int NOT NULL, \`corrects\` int NOT NULL, \`hintsUsed\` int NOT NULL, \`difficulty\` varchar(255) NOT NULL, \`startedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`game\``);
        await queryRunner.query(`DROP TABLE \`record\``);
    }

}
