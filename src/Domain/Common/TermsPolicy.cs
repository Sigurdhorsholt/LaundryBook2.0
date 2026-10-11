namespace Domain.Common;

public static class TermsPolicy
{
    /// <summary>
    /// Version identifier of the currently published terms and data processing agreement. Bump this
    /// (and LEGAL_VERSION in the frontend) whenever either changes materially, so the recorded
    /// acceptance reflects what was agreed. The privacy policy is information and is never accepted.
    /// </summary>
    public const string CurrentVersion = "2026-10-11";
}
