import { UserModel } from '../../../user/models/user.model'

export class AgreeWithPolicyRequest {
  user: UserModel
  agreeDate: Date
}
