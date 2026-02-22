import { PartialType } from "@nestjs/mapped-types";
import { CreateExamDto, CreateExamSectionDto } from "./create-exam.dto";

export class UpdateExamDto extends PartialType(CreateExamDto) {}

export class UpdateExamSectionDto extends PartialType(CreateExamSectionDto) {}
