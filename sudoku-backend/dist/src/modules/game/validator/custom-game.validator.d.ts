import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class IsPerfectSquareConstraint implements ValidatorConstraintInterface {
    validate(value: number, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
