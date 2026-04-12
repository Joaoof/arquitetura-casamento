import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT') || 587;
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    if (!host || !user || !pass) {
      this.logger.warn(
        'Configuração de e-mail ausente (MAIL_HOST, MAIL_USER, MAIL_PASSWORD). Envios desativados.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendMail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    if (!this.transporter) {
      this.logger.warn(`E-mail não enviado para ${to}: transporter não configurado.`);
      return;
    }

    const from =
      this.configService.get<string>('MAIL_FROM') ||
      this.configService.get<string>('MAIL_USER');

    try {
      await this.transporter.sendMail({
        from: `"Luis & Natiele" <${from}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail para ${to}:`, error);
      throw error;
    }
  }
}