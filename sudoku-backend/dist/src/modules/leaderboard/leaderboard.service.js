"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LeaderboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const record_entity_1 = require("./entities/record.entity");
let LeaderboardService = LeaderboardService_1 = class LeaderboardService {
    constructor(recordRepository) {
        this.recordRepository = recordRepository;
    }
    async addRecord(record) {
        const newRecord = this.recordRepository.create({
            username: record.username,
            score: record.score,
            difficulty: record.difficulty,
            completedAt: new Date(),
        });
        try {
            await this.recordRepository.save(newRecord);
        }
        catch (err) {
            common_1.Logger.error(`Could not addRecord for record: ${JSON.stringify(record)}, with error: ${err}`, LeaderboardService_1.name);
        }
        return newRecord;
    }
    async getTopRecords() {
        const topRecordsBeginner = await this.getTopRecordsByDifficulty('beginner');
        const topRecordsIntermediate = await this.getTopRecordsByDifficulty('intermediate');
        const topRecordsHard = await this.getTopRecordsByDifficulty('hard');
        const topRecordsExpert = await this.getTopRecordsByDifficulty('expert');
        return {
            beginner: topRecordsBeginner,
            intermediate: topRecordsIntermediate,
            hard: topRecordsHard,
            expert: topRecordsExpert,
        };
    }
    async removeRecord(recordId) {
        const result = await this.recordRepository.delete(recordId);
        if (result.affected === 0) {
            return `No record found with ID ${recordId}`;
        }
        return `Record with ID ${recordId} removed successfully`;
    }
    async getTopRecordsByDifficulty(difficulty) {
        let records = [];
        try {
            records = await this.recordRepository.find({
                where: {
                    difficulty: difficulty,
                },
                order: {
                    score: 'DESC',
                },
                take: 3,
            });
        }
        catch (err) {
            common_1.Logger.warn(`Could not find getTopRecordsByDifficulty for difficulty: ${difficulty}, with error: ${err}`, LeaderboardService_1.name);
        }
        return records;
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = LeaderboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(record_entity_1.Record)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map