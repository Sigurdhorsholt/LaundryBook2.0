namespace Infrastructure.Email.Templates;

internal static class PasswordResetEmailTemplate
{
    internal static string Html(string resetLink, string landingPageUrl) => $$"""
        <!DOCTYPE html>
        <html lang="da">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <meta name="x-apple-disable-message-reformatting">
          <style>
            @media screen and (max-width: 600px) {
              .main-table { width: 100% !important; }
              .content-padding { padding: 30px 20px !important; }
            }
          </style>
        </head>
        <body style="margin:0;padding:0;background-color:#f2faf5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f2faf5;table-layout:fixed;">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table class="main-table" width="600" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;background-color:#ffffff;border:1px solid #b8ddc9;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(61,122,92,0.05);">

                  <tr>
                    <td align="center" style="background-color:#3d7a5c;padding:40px 20px;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:#d0ecdb;text-transform:uppercase;">Kontosikkerhed</p>
                      <h1 style="margin:10px 0 0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">LaundryBook</h1>
                    </td>
                  </tr>

                  <tr>
                    <td class="content-padding" style="padding:40px 48px 32px;">
                      <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a2e24;">Nulstil din adgangskode</h2>
                      <p style="margin:0 0 28px;font-size:15px;color:#1a2e24;line-height:1.65;">
                        Vi har modtaget en anmodning om at nulstille adgangskoden til din <strong>LaundryBook</strong>-konto.
                        Klik p&aring; knappen nedenfor for at v&aelig;lge en ny adgangskode.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fff8e1;border-radius:10px;border-left:4px solid #f59e0b;margin:0 0 32px;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                              &#9888; Linket er gyldigt i <strong>1 time</strong>.
                              Har du ikke bedt om dette, kan du ignorere denne e-mail &mdash; din adgangskode er ikke &aelig;ndret.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 36px;">
                        <tr>
                          <td align="center" style="background-color:#3d7a5c;border-radius:8px;">
                            <a href="{{resetLink}}" style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:0.2px;">
                              Nulstil adgangskode &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f2faf5;border-radius:8px;border:1px solid #b8ddc9;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#2a5c42;text-transform:uppercase;letter-spacing:0.8px;">
                              Virker linket ikke?
                            </p>
                            <p style="margin:0;font-size:12px;color:#3d7a5c;word-break:break-all;">
                              <a href="{{resetLink}}" style="color:#3d7a5c;text-decoration:underline;">{{resetLink}}</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td class="content-padding" style="background-color:#f2faf5;padding:24px 48px 28px;border-top:1px solid #b8ddc9;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#2a5c42;opacity:0.7;line-height:1.6;">
                        Denne e-mail er sendt automatisk. Svar ikke p&aring; denne besked.<br>
                        <a href="{{landingPageUrl}}" style="color:#3d7a5c;text-decoration:none;font-weight:600;">G&aring; til LaundryBook</a>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;

    internal static string Text(string resetLink, string landingPageUrl) => $"""
        Nulstil din adgangskode til LaundryBook
        ========================================

        Vi har modtaget en anmodning om at nulstille adgangskoden til din LaundryBook-konto.

        Klik på linket nedenfor for at vælge en ny adgangskode:
        {resetLink}

        Linket er gyldigt i 1 time.
        Har du ikke bedt om dette, kan du ignorere denne e-mail — din adgangskode er ikke ændret.

        ---
        Denne e-mail er sendt automatisk. Svar ikke på denne besked.

        LaundryBook — {landingPageUrl}
        """;
}
