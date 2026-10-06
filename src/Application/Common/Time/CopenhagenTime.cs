namespace Application.Common.Time;

// Booking dates and slot times are stored as Copenhagen wall-clock values (MVP is Copenhagen-only),
// so every "now"/"today" comparison against them must happen in that zone, not UTC.
public static class CopenhagenTime
{
    private static readonly TimeZoneInfo Zone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Copenhagen");

    public static DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Zone);

    public static DateOnly Today => DateOnly.FromDateTime(Now);

    public static DateTime ToUtc(DateOnly date, TimeOnly time)
    {
        var local = date.ToDateTime(time, DateTimeKind.Unspecified);
        // A wall-clock time skipped by the spring-forward change (02:00–03:00) has no UTC instant;
        // treat it as the moment the clocks jump to.
        if (Zone.IsInvalidTime(local))
            local = local.AddHours(1);
        return TimeZoneInfo.ConvertTimeToUtc(local, Zone);
    }
}
