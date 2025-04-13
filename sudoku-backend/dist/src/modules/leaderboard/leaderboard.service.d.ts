import { Repository } from 'typeorm';
import { Record } from './entities/record.entity';
import { RecordDto } from './dto/record.dto';
export declare class LeaderboardService {
    private readonly recordRepository;
    constructor(recordRepository: Repository<Record>);
    addRecord(record: RecordDto): Promise<Record>;
    getTopRecords(): Promise<{
        beginner: Record[];
        intermediate: Record[];
        hard: Record[];
        expert: Record[];
    }>;
    removeRecord(recordId: string): Promise<string>;
    getTopRecordsByDifficulty(difficulty: string): Promise<Record[]>;
}
