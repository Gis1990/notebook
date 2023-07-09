import { AuthRequest } from './auth.request';
import { Testing } from './testing.request';
import { UserFactory } from './user.factory';
import { ContactRequest } from './contact.request';

export class Requests {
  private readonly server: any;
  constructor(server) {
    this.server = server;
  }

  auth() {
    return new AuthRequest(this.server);
  }

  contact() {
    return new ContactRequest(this.server);
  }

  testing() {
    return new Testing(this.server);
  }

  userFactory() {
    return new UserFactory(
      this.server,
      this.auth(),
      this.contact(),
      this.testing(),
    );
  }
}
