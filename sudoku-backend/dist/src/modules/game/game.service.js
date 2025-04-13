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
var GameService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const game_utils_1 = require("./utils/game.utils");
const game_entity_1 = require("./entities/game.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const MS_IN_ONE_SECOND = 1000;
const GRACE_POINTS = 500;
let GameService = GameService_1 = class GameService {
    constructor(gameRepository) {
        this.gameRepository = gameRepository;
    }
    async create(createGameDto) {
        const gridDimension = createGameDto.gridDimension;
        const difficulty = createGameDto.difficulty;
        let grid = (0, game_utils_1.createEmptyGrid)(gridDimension);
        (0, game_utils_1.solveSudoku)(grid, gridDimension);
        common_1.Logger.debug(`Generated Sudoku Grid (Solved)`, GameService_1.name);
        const hiddenGrid = (0, game_utils_1.createHiddenGrid)(grid, difficulty);
        const visibleCount = (0, game_utils_1.countVisibleNumbers)(hiddenGrid);
        common_1.Logger.debug(`Generated Sudoku Grid (Hidden) with visible numbers: ${visibleCount}`, GameService_1.name);
        const newGame = this.gameRepository.create({
            grid: grid,
            hintsUsed: 0,
            errors: 0,
            corrects: 0,
            currentGrid: hiddenGrid,
            difficulty: difficulty,
            startedAt: new Date(),
            visibleValuesCount: visibleCount
        });
        const savedGame = await this.gameRepository.save(newGame);
        return {
            gameId: savedGame.id,
            hiddenGrid: savedGame.currentGrid,
            visibleCount: savedGame.visibleValuesCount
        };
    }
    async checkValue(checkValueGameDto) {
        const myGame = await this.gameRepository.findOneBy({ id: checkValueGameDto.gameId });
        if (!myGame) {
            throw new common_1.NotFoundException('Game not found');
        }
        if (myGame.grid[checkValueGameDto.row][checkValueGameDto.column] === checkValueGameDto.value) {
            myGame.currentGrid[checkValueGameDto.row][checkValueGameDto.column] = checkValueGameDto.value;
            myGame.visibleValuesCount++;
            myGame.corrects++;
            await this.gameRepository.save(myGame);
            return {
                correct: true,
                visibleValuesCount: myGame.visibleValuesCount,
                errors: myGame.errors,
                correctCount: myGame.corrects
            };
        }
        else {
            myGame.currentGrid[checkValueGameDto.row][checkValueGameDto.column] = checkValueGameDto.value;
            myGame.errors++;
            await this.gameRepository.save(myGame);
            return {
                correct: false,
                visibleValuesCount: myGame.visibleValuesCount,
                errors: myGame.errors,
                correctCount: myGame.corrects
            };
        }
    }
    async checkHintLimitAndReturnValue(checkGameInformationDto) {
        const myGame = await this.gameRepository.findOneBy({ id: checkGameInformationDto.gameId });
        if (!myGame) {
            throw new common_1.NotFoundException('Game not found');
        }
        if (myGame.hintsUsed >= 10) {
            return {
                error: 'Maximum hints used',
                hintsUsed: myGame.hintsUsed,
                maxHints: 10
            };
        }
        if (myGame.visibleValuesCount >= 81) {
            return {
                error: 'Puzzle is completed',
                hintsUsed: myGame.hintsUsed,
                visibleValuesCount: myGame.visibleValuesCount
            };
        }
        if (myGame.hintsUsed < 10 && myGame.visibleValuesCount < 81) {
            let correctValue;
            let correctRow;
            let correctColumn;
            const emptyCells = [];
            for (let row = 0; row < myGame.currentGrid.length; row++) {
                for (let col = 0; col < myGame.currentGrid[row].length; col++) {
                    if (myGame.currentGrid[row][col] === 0) {
                        emptyCells.push({ row, col });
                    }
                }
            }
            if (emptyCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * emptyCells.length);
                const { row, col } = emptyCells[randomIndex];
                correctValue = myGame.grid[row][col];
                correctRow = row;
                correctColumn = col;
                myGame.currentGrid[row][col] = correctValue;
            }
            myGame.hintsUsed++;
            myGame.visibleValuesCount++;
            await this.gameRepository.save(myGame);
            return {
                rowIndex: correctRow,
                columnIndex: correctColumn,
                value: correctValue,
                visibleValuesCount: myGame.visibleValuesCount
            };
        }
        else {
            return false;
        }
    }
    async getScore(getScore) {
        const myGame = await this.gameRepository.findOneBy({ id: getScore.gameId });
        if (!myGame) {
            throw new common_1.NotFoundException('Game not found');
        }
        let currentTime = new Date();
        let correctScore = myGame.corrects * 5;
        common_1.Logger.debug(`Correct Score: ${correctScore}`, GameService_1.name);
        let errorScore = myGame.errors * 1;
        common_1.Logger.debug(`Error Score: ${errorScore}`, GameService_1.name);
        let hintsNegativeScoring = 0;
        for (let count = 0; count <= myGame.hintsUsed; count++) {
            hintsNegativeScoring = hintsNegativeScoring + 3 + count;
        }
        common_1.Logger.debug(`Hints Negative Scoring: ${hintsNegativeScoring}`, GameService_1.name);
        let timeDifferenceInSeconds = (currentTime.getTime() - myGame.startedAt.getTime()) / MS_IN_ONE_SECOND;
        common_1.Logger.debug(`Time Difference (seconds): ${timeDifferenceInSeconds}`, GameService_1.name);
        let timeBonus = Math.round(GRACE_POINTS - timeDifferenceInSeconds);
        common_1.Logger.debug(`Time Bonus: ${timeBonus}`, GameService_1.name);
        let totalScore = correctScore - (errorScore + hintsNegativeScoring) + (timeBonus > 0 ? timeBonus : 0);
        common_1.Logger.debug(`Total Score: ${totalScore}`, GameService_1.name);
        if (totalScore < 0) {
            totalScore = 0;
        }
        return totalScore;
    }
    async isGameCompleted(checkGameInformationDto) {
        const game = await this.gameRepository.findOneBy({ id: checkGameInformationDto.gameId });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        for (let row = 0; row < game.currentGrid.length; row++) {
            for (let col = 0; col < game.currentGrid[row].length; col++) {
                if (game.currentGrid[row][col] === 0) {
                    return false;
                }
            }
        }
        for (let row = 0; row < game.currentGrid.length; row++) {
            for (let col = 0; col < game.currentGrid[row].length; col++) {
                if (game.currentGrid[row][col] !== game.grid[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }
};
exports.GameService = GameService;
exports.GameService = GameService = GameService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_entity_1.Game)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GameService);
//# sourceMappingURL=game.service.js.map