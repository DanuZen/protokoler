import { PartialType } from '@nestjs/mapped-types';
import { CreatePenugasanDto } from './create-penugasan.dto';

export class UpdatePenugasanDto extends PartialType(CreatePenugasanDto) {}
