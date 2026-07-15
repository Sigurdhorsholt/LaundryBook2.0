namespace Domain.Common;

public static class TermsPolicy
{
    /// <summary>
    /// Version identifier of the currently published terms + privacy policy. Bump this whenever
    /// the terms or privacy policy change materially, so recorded consent reflects what was agreed.
    /// </summary>
    public const string CurrentVersion = "2026-07-15";
}
