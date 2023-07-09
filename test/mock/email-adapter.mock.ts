export class EmailManagerMock {
  constructor() {}

  async sendConfirmationEmail(email: string, confirmationCode: string) {
    return;
  }

  async sendLoginCodeByEmail(email: string, loginCode: string) {
    return;
  }
}
