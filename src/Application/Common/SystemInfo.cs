namespace Application.Common;

// How this instance was started, for the status card on /system. Built once at startup by Infrastructure.
public record SystemInfo(
    string Environment,
    bool EmailConfigured,
    bool FirebaseConfigured,
    bool ErrorTrackingConfigured,
    string? Commit,
    DateTime StartedAt);
