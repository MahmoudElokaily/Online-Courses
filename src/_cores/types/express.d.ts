import { User } from '/../../user/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

export interface IUserPayload {
  uuid: string;
  name: string;
  email: string;
  role: string;

}
