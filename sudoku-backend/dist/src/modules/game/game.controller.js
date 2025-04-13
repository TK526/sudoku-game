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
var GameController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const create_game_dto_1 = require("./dto/create-game.dto");
const check_score_game_dto_1 = require("./dto/check-score-game.dto");
const check_game_information_dto_1 = require("./dto/check-game-information.dto");
let GameController = GameController_1 = class GameController {
    constructor(gameService) {
        this.gameService = gameService;
    }
    create(createGameDto) {
        common_1.Logger.log(`Entering create game endpoint, with body ${JSON.stringify(createGameDto)}`, GameController_1.name);
        return this.gameService.create(createGameDto);
    }
    isGameCompleted(checkGameInfoDto) {
        common_1.Logger.log(`Entering isGameCompleted endpoint, with body ${JSON.stringify(checkGameInfoDto)}`, GameController_1.name);
        return this.gameService.isGameCompleted(checkGameInfoDto);
    }
    checkValue(checkValueGameDto) {
        common_1.Logger.log(`Entering checkValue endpoint, with body ${JSON.stringify(checkValueGameDto)}`, GameController_1.name);
        return this.gameService.checkValue(checkValueGameDto);
    }
    checkHintLimitAndReturnValue(CheckGameInformationDto) {
        common_1.Logger.log(`Entering checkHintLimitAndReturnValue endpoint, with body ${JSON.stringify(CheckGameInformationDto)}`, GameController_1.name);
        return this.gameService.checkHintLimitAndReturnValue(CheckGameInformationDto);
    }
    getScore(getScoreDto) {
        common_1.Logger.log(`Entering getScore endpoint, with body ${JSON.stringify(getScoreDto)}`, GameController_1.name);
        return this.gameService.getScore(getScoreDto);
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_game_dto_1.CreateGameDto]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('completed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_game_information_dto_1.CheckGameInformationDto]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "isGameCompleted", null);
__decorate([
    (0, common_1.Post)('value'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_score_game_dto_1.CheckValueGameDto]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "checkValue", null);
__decorate([
    (0, common_1.Post)('hint'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_game_information_dto_1.CheckGameInformationDto]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "checkHintLimitAndReturnValue", null);
__decorate([
    (0, common_1.Post)('score'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_game_information_dto_1.CheckGameInformationDto]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "getScore", null);
exports.GameController = GameController = GameController_1 = __decorate([
    (0, common_1.Controller)('game'),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map