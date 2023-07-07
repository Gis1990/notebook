import { settings } from '../../../../config/settings';

export class EmailConfirmation {
  userId: string;
  confirmationCode: string = (
    Date.now() + settings.timeLife.CONFIRMATION_CODE
  ).toString();
  codeForLogin: string = null;

  static async create() {
    return new EmailConfirmation();
  }
}
