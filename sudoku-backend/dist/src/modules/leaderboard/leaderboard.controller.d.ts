import { LeaderboardService } from './leaderboard.service';
import { RecordDto } from './dto/record.dto';
export declare class LeaderboardController {
    private readonly leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getTopRecords(): Promise<{
        beginner: import("./entities/record.entity").Record[];
        intermediate: import("./entities/record.entity").Record[];
        hard: import("./entities/record.entity").Record[];
        expert: import("./entities/record.entity").Record[];
    }>;
    removeRecord(id: string): Promise<string>;
    addRecord(record: RecordDto): Promise<import("./entities/record.entity").Record>;
}
