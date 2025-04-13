import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';
import { Repository } from 'typeorm';
import { CheckValueGameDto } from './dto/check-score-game.dto';
import { CheckGameInformationDto } from './dto/check-game-information.dto';
export declare class GameService {
    private readonly gameRepository;
    constructor(gameRepository: Repository<Game>);
    create(createGameDto: CreateGameDto): Promise<{
        gameId: string;
        hiddenGrid: number[][];
        visibleCount: number;
    }>;
    checkValue(checkValueGameDto: CheckValueGameDto): Promise<{
        correct: boolean;
        visibleValuesCount: number;
        errors: number;
        correctCount: number;
    }>;
    checkHintLimitAndReturnValue(checkGameInformationDto: CheckGameInformationDto): Promise<false | {
        error: string;
        hintsUsed: number;
        maxHints: number;
        visibleValuesCount?: undefined;
        rowIndex?: undefined;
        columnIndex?: undefined;
        value?: undefined;
    } | {
        error: string;
        hintsUsed: number;
        visibleValuesCount: number;
        maxHints?: undefined;
        rowIndex?: undefined;
        columnIndex?: undefined;
        value?: undefined;
    } | {
        rowIndex: any;
        columnIndex: any;
        value: any;
        visibleValuesCount: number;
        error?: undefined;
        hintsUsed?: undefined;
        maxHints?: undefined;
    }>;
    getScore(getScore: CheckGameInformationDto): Promise<number>;
    isGameCompleted(checkGameInformationDto: CheckGameInformationDto): Promise<boolean>;
}
