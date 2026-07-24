import { AutoMap } from "@automapper/classes";

export class UserPlanDto {
  @AutoMap()
  dateActive: Date

  @AutoMap()
  dateExpire: Date
}