export class EmailManagerMock {
  constructor() {}

  async sendConfirmationEmail(email: string, confirmationCode: string) {
    return;
  }

  async sendPasswordRecoveryEmail(email: string, recoveryCode: string) {
    return;
  }
}
