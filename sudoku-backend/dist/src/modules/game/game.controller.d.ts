import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { CheckValueGameDto } from './dto/check-score-game.dto';
import { CheckGameInformationDto } from './dto/check-game-information.dto';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    create(createGameDto: CreateGameDto): Promise<{
        gameId: string;
        hiddenGrid: number[][];
        visibleCount: number;
    }>;
    isGameCompleted(checkGameInfoDto: CheckGameInformationDto): Promise<boolean>;
    checkValue(checkValueGameDto: CheckValueGameDto): Promise<{
        correct: boolean;
        visibleValuesCount: number;
        errors: number;
        correctCount: number;
    }>;
    checkHintLimitAndReturnValue(CheckGameInformationDto: CheckGameInformationDto): Promise<false | {
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
    getScore(getScoreDto: CheckGameInformationDto): Promise<number>;
}
