using System.Net;

namespace Infrastructure.Email.Templates;

// E-handelsloven § 12: confirms the signup, and records which terms version was accepted
internal static class SignupConfirmationEmailTemplate
{
    internal static string Html(string firstName, string propertyName, bool createdAssociation, string termsVersion, string landingPageUrl)
    {
        // Names are typed by users, so they must not be able to inject markup into the email
        var name = WebUtility.HtmlEncode(firstName);
        var property = WebUtility.HtmlEncode(propertyName);
        var eyebrow = createdAssociation ? "Ny forening" : "Ny konto";
        var title = createdAssociation ? "Foreningen er oprettet" : "Din konto er oprettet";
        var intro = createdAssociation
            ? $"Hej {name}. Vi har modtaget oprettelsen af <strong>{property}</strong>. Vi aktiverer foreningen, n&aring;r vi har set den. Indtil da kan du s&aelig;tte vaskerum, maskiner og vasketider op."
            : $"Hej {name}. Din konto er oprettet, og du er tilknyttet <strong>{property}</strong>. Du kan nu booke vasketider.";
        var accepted = createdAssociation
            ? "Du har accepteret vilk&aring;rene og databehandleraftalen p&aring; foreningens vegne."
            : "Du har accepteret vilk&aring;rene.";
        var dpaLink = createdAssociation
            ? $""" &middot; <a href="{landingPageUrl}/databehandleraftale" style="color:#3d7a5c;text-decoration:underline;">Databehandleraftale</a>"""
            : "";
        var notYou = createdAssociation
            ? "Har du ikke selv oprettet foreningen, kan du se bort fra denne e-mail."
            : "Har du ikke selv oprettet kontoen, s&aring; kontakt foreningens administrator.";

        return $$"""
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
                          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:#d0ecdb;text-transform:uppercase;">{{eyebrow}}</p>
                          <h1 style="margin:10px 0 0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">LaundryBook</h1>
                        </td>
                      </tr>

                      <tr>
                        <td class="content-padding" style="padding:40px 48px 32px;">
                          <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a2e24;">{{title}}</h2>
                          <p style="margin:0 0 28px;font-size:15px;color:#1a2e24;line-height:1.65;">{{intro}}</p>

                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#e8f5ee;border-radius:10px;border-left:4px solid #3d7a5c;margin:0 0 32px;">
                            <tr>
                              <td style="padding:16px 20px;">
                                <p style="margin:0 0 6px;font-size:14px;color:#1a2e24;line-height:1.5;">{{accepted}} Version: {{termsVersion}}.</p>
                                <p style="margin:0;font-size:13px;color:#2a5c42;line-height:1.5;">
                                  <a href="{{landingPageUrl}}/vilkaar" style="color:#3d7a5c;text-decoration:underline;">Vilk&aring;r</a>{{dpaLink}}
                                  &middot; <a href="{{landingPageUrl}}/privatliv" style="color:#3d7a5c;text-decoration:underline;">Privatlivspolitik</a>
                                </p>
                              </td>
                            </tr>
                          </table>

                          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 12px;">
                            <tr>
                              <td align="center" style="background-color:#3d7a5c;border-radius:8px;">
                                <a href="{{landingPageUrl}}" style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:0.2px;">
                                  G&aring; til LaundryBook &rarr;
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td class="content-padding" style="background-color:#f2faf5;padding:24px 48px 28px;border-top:1px solid #b8ddc9;text-align:center;">
                          <p style="margin:0;font-size:12px;color:#2a5c42;opacity:0.7;line-height:1.6;">
                            {{notYou}}<br>
                            Denne e-mail er sendt automatisk. Svar ikke p&aring; denne besked.
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
    }

    internal static string Text(string firstName, string propertyName, bool createdAssociation, string termsVersion, string landingPageUrl)
    {
        var body = createdAssociation
            ? $"""
              Foreningen er oprettet
              ======================

              Hej {firstName}. Vi har modtaget oprettelsen af {propertyName}. Vi aktiverer foreningen, når vi har set den. Indtil da kan du sætte vaskerum, maskiner og vasketider op.

              Du har accepteret vilkårene og databehandleraftalen på foreningens vegne. Version: {termsVersion}.
              Vilkår: {landingPageUrl}/vilkaar
              Databehandleraftale: {landingPageUrl}/databehandleraftale
              Privatlivspolitik: {landingPageUrl}/privatliv

              ---
              Har du ikke selv oprettet foreningen, kan du se bort fra denne e-mail.
              """
            : $"""
              Din konto er oprettet
              =====================

              Hej {firstName}. Din konto er oprettet, og du er tilknyttet {propertyName}. Du kan nu booke vasketider.

              Du har accepteret vilkårene. Version: {termsVersion}.
              Vilkår: {landingPageUrl}/vilkaar
              Privatlivspolitik: {landingPageUrl}/privatliv

              ---
              Har du ikke selv oprettet kontoen, så kontakt foreningens administrator.
              """;

        return $"""
            {body}
            Denne e-mail er sendt automatisk. Svar ikke på denne besked.

            LaundryBook - {landingPageUrl}
            """;
    }
}
