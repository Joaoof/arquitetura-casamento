import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const resendKey = this.configService.get<string>('RESEND_API_KEY');

    // Resend tem prioridade — funciona em qualquer host (HTTP, sem bloqueio de porta SMTP)
    if (resendKey) {
      this.resend = new Resend(resendKey);
      this.logger.log('Mail provider: Resend API (HTTP)');
      return;
    }

    // Fallback: SMTP clássico (pode ser bloqueado por alguns provedores de hospedagem)
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT') || 587;
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    if (!host || !user || !pass) {
      this.logger.warn(
        'Configuração de e-mail ausente. Defina RESEND_API_KEY (recomendado) ou MAIL_HOST/USER/PASSWORD. Envios desativados.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    this.logger.log('Mail provider: SMTP');
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
    const fromAddress =
      this.configService.get<string>('MAIL_FROM') ||
      this.configService.get<string>('MAIL_USER') ||
      'onboarding@resend.dev';

    // ── Resend (HTTP API) ────────────────────────────────────────────
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: `Luís & Natiele <${fromAddress}>`,
          to,
          subject,
          html,
        });
      } catch (error) {
        this.logger.error(`Resend: falha ao enviar para ${to}:`, error);
        throw error;
      }
      return;
    }

    // ── SMTP (fallback) ──────────────────────────────────────────────
    if (!this.transporter) {
      this.logger.warn(`E-mail não enviado para ${to}: nenhum provider configurado.`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Luis & Natiele" <${fromAddress}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`SMTP: falha ao enviar para ${to}:`, error);
      throw error;
    }
  }
}
