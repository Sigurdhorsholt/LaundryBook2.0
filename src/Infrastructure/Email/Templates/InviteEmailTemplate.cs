namespace Infrastructure.Email.Templates;

internal static class InviteEmailTemplate
{
    internal static string Html(
        string propertyName,
        string propertyAddress,
        string adminName,
        string passwordSetupLink,
        string landingPageUrl) => $$"""
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
              .mobile-full-width { width: 100% !important; display: block !important; }
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
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:#d0ecdb;text-transform:uppercase;">Invitation</p>
                      <h1 style="margin:10px 0 0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">LaundryBook</h1>
                    </td>
                  </tr>

                  <tr>
                    <td class="content-padding" style="padding:40px 48px 32px;">
                      <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a2e24;">Du er inviteret!</h2>
                      <p style="margin:0 0 28px;font-size:15px;color:#1a2e24;line-height:1.65;">
                        Du har modtaget en invitation til at bruge <strong>LaundryBook</strong> &mdash; bookingsystemet til din ejendoms vaskerum.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#e8f5ee;border-radius:10px;border-left:4px solid #3d7a5c;margin:0 0 32px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#3d7a5c;text-transform:uppercase;">Din ejendom</p>
                            <p style="margin:0 0 6px;font-size:19px;font-weight:700;color:#1a2e24;">{{propertyName}}</p>
                            <p style="margin:0;font-size:14px;color:#1a2e24;opacity:0.8;">{{propertyAddress}}</p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 28px;font-size:15px;color:#1a2e24;line-height:1.65;">
                        Klik p&aring; knappen nedenfor for at oprette din adgangskode og aktivere din konto.<br>
                        <span style="font-size:13px;color:#2a5c42;">Linket udl&oslash;ber om 7 dage.</span>
                      </p>

                      <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 36px;">
                        <tr>
                          <td align="center" style="background-color:#3d7a5c;border-radius:8px;">
                            <a href="{{passwordSetupLink}}" style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:0.2px;">
                              Opret din adgangskode &rarr;
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
                              <a href="{{passwordSetupLink}}" style="color:#3d7a5c;text-decoration:underline;">{{passwordSetupLink}}</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td class="content-padding" style="background-color:#f2faf5;padding:24px 48px 28px;border-top:1px solid #b8ddc9;text-align:center;">
                      <p style="margin:0 0 10px;font-size:13px;color:#2a5c42;line-height:1.6;">
                        Denne invitation er sendt af <strong style="color:#1a2e24;">{{adminName}}</strong> p&aring; vegne af {{propertyName}}.
                      </p>
                      <p style="margin:0;font-size:12px;color:#2a5c42;opacity:0.7;line-height:1.6;">
                        Har du ikke forventet denne e-mail? Du kan blot ignorere den.<br>
                        <a href="{{landingPageUrl}}" style="color:#3d7a5c;text-decoration:none;font-weight:600;">L&aelig;s mere om LaundryBook</a>
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

    internal static string Text(
        string propertyName,
        string propertyAddress,
        string adminName,
        string passwordSetupLink,
        string landingPageUrl) => $"""
        Du er inviteret til LaundryBook!
        ================================

        Du har modtaget en invitation til at bruge LaundryBook — bookingsystemet til din ejendoms vaskerum.

        Ejendom : {propertyName}
        Adresse  : {propertyAddress}

        Opret din adgangskode ved at besøge dette link:
        {passwordSetupLink}

        Linket udløber om 7 dage.

        ---
        Invitationen er sendt af {adminName} på vegne af {propertyName}.
        Har du ikke forventet denne e-mail, kan du blot se bort fra den.

        LaundryBook — {landingPageUrl}
        """;
}
