import { AutoMap } from "@automapper/classes";
import { UserPlanDto } from "./user-plan.dto";

export class PlanDto {
  @AutoMap()
  id: number

  @AutoMap()
  name: string

  @AutoMap()
  description: string

  @AutoMap()
  code: string

  @AutoMap()
  price: number

  @AutoMap()
  numWorkspaces: number

  @AutoMap()
  numProjects: number

  @AutoMap()
  numMembers: number

  @AutoMap()
  aiTaskTitle: boolean

  @AutoMap(() => UserPlanDto)
  active: UserPlanDto
}