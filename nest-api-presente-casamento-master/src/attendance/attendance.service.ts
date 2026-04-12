import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const email = createAttendanceDto.email.trim().toLowerCase();
    const data = {
      fullName: createAttendanceDto.fullName.trim(),
      phone: createAttendanceDto.phone?.trim(),
      isAttending: createAttendanceDto.isAttending,
      companions: createAttendanceDto.companions ?? 0,
      message: createAttendanceDto.message?.trim(),
    };

    const attendance = await this.prisma.attendance.upsert({
      where: { email },
      update: data,
      create: { email, ...data },
    });

    // Envia e-mail de confirmação em background (não bloqueia a resposta)
    setImmediate(() => {
      this.sendConfirmationEmail(attendance).catch((err) =>
        console.error('Erro ao enviar e-mail de confirmação de presença:', err),
      );
    });

    return attendance;
  }

  private async sendConfirmationEmail(attendance: {
    fullName: string;
    email: string;
    isAttending: boolean;
    companions: number;
  }) {
    const subject = attendance.isAttending
      ? `Presença confirmada! 🎉 — Luís & Natiele`
      : `Recebemos sua resposta — Luís & Natiele`;

    const html = this.buildConfirmationEmailHtml(attendance);

    await this.mailService.sendMail({
      to: attendance.email,
      subject,
      html,
    });
  }

  private buildConfirmationEmailHtml(attendance: {
    fullName: string;
    isAttending: boolean;
    companions: number;
  }): string {
    const firstName = attendance.fullName.split(' ')[0];
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || '';
    const photoUrl = frontendUrl ? `${frontendUrl}/img9.JPG` : '';

    const photoBlock = photoUrl
      ? `<tr>
          <td style="padding:0;line-height:0;">
            <img src="${photoUrl}" alt="Luís e Natiele" width="600"
              style="display:block;width:100%;height:280px;object-fit:cover;object-position:top;" />
          </td>
        </tr>`
      : '';

    const attendingBody = `
      <p style="margin:0 0 10px;font-size:16px;color:#1e293b;line-height:1.7;">
        Sua presença foi <strong style="color:#1B3A6B;">confirmada</strong> com sucesso! 🎉
      </p>
      <p style="margin:0 0 36px;font-size:15px;color:#64748b;line-height:1.75;">
        Mal podemos esperar para celebrar este momento especial ao seu lado.
        Prepare-se — vai ser inesquecível!
      </p>

      <!-- Divisor -->
      <div style="height:1px;background:linear-gradient(90deg,transparent,#C8DCF0,transparent);margin:0 0 32px;"></div>

      <!-- Detalhes do evento -->
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f0f6ff;border-radius:14px;border:1px solid #dbe9f8;overflow:hidden;">
        <tr>
          <td style="padding:22px 26px 8px;">
            <p style="margin:0 0 18px;font-size:10px;font-weight:700;letter-spacing:0.35em;text-transform:uppercase;color:#4A7AB5;">
              detalhes do evento
            </p>
          </td>
        </tr>

        <!-- Data -->
        <tr>
          <td style="padding:0 26px 16px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle;">
                <div style="width:38px;height:38px;background:rgba(74,122,181,0.12);border-radius:10px;text-align:center;line-height:38px;font-size:18px;">📅</div>
              </td>
              <td style="padding-left:14px;vertical-align:middle;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#1B3A6B;">25 de Julho de 2026</p>
                <p style="margin:3px 0 0;font-size:12px;color:#7AAFD4;">Sábado</p>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Horário -->
        <tr>
          <td style="padding:0 26px 16px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle;">
                <div style="width:38px;height:38px;background:rgba(74,122,181,0.12);border-radius:10px;text-align:center;line-height:38px;font-size:18px;">⏰</div>
              </td>
              <td style="padding-left:14px;vertical-align:middle;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#1B3A6B;">18:00h</p>
                <p style="margin:3px 0 0;font-size:12px;color:#7AAFD4;">Horário de Brasília</p>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Local -->
        <tr>
          <td style="padding:0 26px 16px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle;">
                <div style="width:38px;height:38px;background:rgba(74,122,181,0.12);border-radius:10px;text-align:center;line-height:38px;font-size:18px;">📍</div>
              </td>
              <td style="padding-left:14px;vertical-align:middle;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#1B3A6B;">Araguaína, Tocantins</p>
                <p style="margin:3px 0 0;font-size:12px;color:#7AAFD4;">Local a confirmar em breve</p>
              </td>
            </tr></table>
          </td>
        </tr>

        ${
          attendance.companions > 0
            ? `<!-- Acompanhantes -->
        <tr>
          <td style="padding:0 26px 22px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle;">
                <div style="width:38px;height:38px;background:rgba(74,122,181,0.12);border-radius:10px;text-align:center;line-height:38px;font-size:18px;">👥</div>
              </td>
              <td style="padding-left:14px;vertical-align:middle;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#1B3A6B;">${attendance.companions + 1} pessoa(s) confirmadas</p>
                <p style="margin:3px 0 0;font-size:12px;color:#7AAFD4;">Você + ${attendance.companions} acompanhante(s)</p>
              </td>
            </tr></table>
          </td>
        </tr>`
            : `<tr><td style="padding-bottom:6px;"></td></tr>`
        }
      </table>

      ${
        frontendUrl
          ? `<!-- CTA -->
      <div style="text-align:center;margin-top:32px;">
        <a href="${frontendUrl}"
          style="display:inline-block;background:linear-gradient(135deg,#1B3A6B,#4A7AB5);color:#ffffff;
                 text-decoration:none;font-size:14px;font-weight:700;padding:15px 36px;border-radius:100px;
                 box-shadow:0 4px 20px rgba(27,58,107,0.3);letter-spacing:0.04em;">
          Ver Site do Casamento →
        </a>
      </div>`
          : ''
      }`;

    const notAttendingBody = `
      <p style="margin:0 0 10px;font-size:16px;color:#1e293b;line-height:1.7;">
        Recebemos sua resposta.
      </p>
      <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.75;">
        Sentiremos muito a sua falta, mas agradecemos imensamente por nos dar o retorno.
        Você é muito especial para nós! 💙
      </p>

      <div style="height:1px;background:linear-gradient(90deg,transparent,#C8DCF0,transparent);margin:0 0 32px;"></div>

      ${
        frontendUrl
          ? `<div style="text-align:center;">
        <a href="${frontendUrl}"
          style="display:inline-block;background:linear-gradient(135deg,#1B3A6B,#4A7AB5);color:#ffffff;
                 text-decoration:none;font-size:14px;font-weight:700;padding:15px 36px;border-radius:100px;
                 box-shadow:0 4px 20px rgba(27,58,107,0.3);letter-spacing:0.04em;">
          Ver Site do Casamento →
        </a>
      </div>`
          : ''
      }`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${attendance.isAttending ? 'Presença Confirmada' : 'Resposta Recebida'} — Luís &amp; Natiele</title>
</head>
<body style="margin:0;padding:0;background:#eef4fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background:#eef4fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;
                 overflow:hidden;box-shadow:0 8px 40px rgba(27,58,107,0.12);">

          <!-- ── HEADER ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#1B3A6B 0%,#2a5298 55%,#4A7AB5 100%);padding:44px 48px 36px;text-align:center;">
              <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.4em;
                         text-transform:uppercase;color:rgba(200,220,240,0.65);">
                ✦ &nbsp; casamento &nbsp; ✦
              </p>
              <h1 style="margin:0 0 10px;font-size:38px;font-weight:300;letter-spacing:0.06em;
                          color:#ffffff;font-family:Georgia,'Times New Roman',serif;">
                Luís &amp; Natiele
              </h1>
              <div style="display:inline-block;background:rgba(255,255,255,0.12);
                           border:1px solid rgba(200,220,240,0.25);border-radius:100px;
                           padding:6px 20px;margin-top:4px;">
                <p style="margin:0;font-size:12px;color:rgba(200,220,240,0.85);letter-spacing:0.12em;">
                  25 de Julho de 2026 &nbsp;·&nbsp; Araguaína, TO
                </p>
              </div>
            </td>
          </tr>

          <!-- ── FOTO DO CASAL ── -->
          ${photoBlock}

          <!-- ── BADGE DE STATUS ── -->
          <tr>
            <td style="padding:0;">
              <div style="background:${attendance.isAttending ? 'linear-gradient(90deg,#1B3A6B,#4A7AB5)' : '#64748b'};
                           text-align:center;padding:10px 24px;">
                <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;
                           text-transform:uppercase;color:#ffffff;">
                  ${attendance.isAttending ? '✓  presença confirmada' : '—  não poderá comparecer'}
                </p>
              </div>
            </td>
          </tr>

          <!-- ── CORPO ── -->
          <tr>
            <td style="padding:44px 48px 40px;">

              <!-- Saudação -->
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.3em;
                          text-transform:uppercase;color:#7AAFD4;">
                olá,
              </p>
              <h2 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#1B3A6B;
                          font-family:Georgia,'Times New Roman',serif;">
                ${firstName}!
              </h2>

              ${attendance.isAttending ? attendingBody : notAttendingBody}

            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#1B3A6B,#2a5298);padding:36px 48px;text-align:center;">
              <p style="margin:0 0 14px;font-size:22px;">💙</p>
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.3em;
                          text-transform:uppercase;color:rgba(200,220,240,0.6);">
                com amor,
              </p>
              <h3 style="margin:0 0 10px;font-size:24px;font-weight:300;color:#ffffff;
                          font-family:Georgia,'Times New Roman',serif;letter-spacing:0.06em;">
                Luís &amp; Natiele
              </h3>
              <p style="margin:0;font-size:12px;color:rgba(200,220,240,0.5);letter-spacing:0.08em;">
                25 de Julho de 2026 &nbsp;·&nbsp; Araguaína, TO
              </p>
            </td>
          </tr>

        </table>

        <!-- Sub-rodapé fora do card -->
        <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.6;">
          Você recebeu este e-mail porque confirmou (ou respondeu) o convite de Luís &amp; Natiele.<br>
          Caso tenha recebido por engano, ignore esta mensagem.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`;
  }

  async findAllForAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
    isAttending?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Number(params.limit) || 20);
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {};

    if (params.search?.trim()) {
      const term = params.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (params.isAttending === 'true') where.isAttending = true;
    if (params.isAttending === 'false') where.isAttending = false;

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async stats() {
    const [total, confirmed, declined, companions] = await Promise.all([
      this.prisma.attendance.count(),
      this.prisma.attendance.count({ where: { isAttending: true } }),
      this.prisma.attendance.count({ where: { isAttending: false } }),
      this.prisma.attendance.aggregate({
        _sum: {
          companions: true,
        },
        where: {
          isAttending: true,
        },
      }),
    ]);

    return {
      total,
      confirmed,
      declined,
      totalExpectedGuests: confirmed + (companions._sum.companions ?? 0),
    };
  }
}
