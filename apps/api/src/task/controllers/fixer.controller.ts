import { Auth } from '../../auth/decorators/auth.decorator'
import { GlobalRole } from '../../user/access/enum.role'
import { Controller } from '@nestjs/common'

@Auth(GlobalRole.Admin)
@Controller('fixer')
export class FixerController {}
