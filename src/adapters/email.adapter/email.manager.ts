import { Injectable } from '@nestjs/common';
import { EmailAdapters } from './email.adapter';

@Injectable()
export class EmailManager {
  constructor(protected emailAdapters: EmailAdapters) {}

  async sendConfirmationEmail(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    const subject = 'Confirm your email';
    const message = `<h1>Thank you for your registration</h1><p>To finish registration please follow the link below:
                         <a href=\'https://somesite.com/auth/registration-confirmation?confirmationCode=${confirmationCode}\'>link</a>
                         for local development use http://localhost:3000/auth/registration-confirmation?confirmationCode=${confirmationCode}
                         </p>`;

    return await this.emailAdapters.sendEmail(email, subject, message);
  }

  async sendLoginCodeByEmail(email: string, loginCode: string): Promise<void> {
    const subject = 'Code for login';
    const message = `<h1>Login code</h1><p>Please use the code below for login:
                         loginCode=${loginCode}
                         </p>`;

    return await this.emailAdapters.sendEmail(email, subject, message);
  }
}
