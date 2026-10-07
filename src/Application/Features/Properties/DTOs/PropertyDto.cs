using Domain.Enums;

namespace Application.Features.Properties.DTOs;

public record PropertyDto(
    Guid Id,
    string Name,
    string Address,
    ComplexSettingsDto Settings,
    int MemberCount);

public record PropertyDetailDto(
    Guid Id,
    string Name,
    string Address,
    ComplexSettingsDto Settings,
    int UpcomingBookingCount);

public record ComplexSettingsDto(
    BookingMode BookingMode,
    int CancellationWindowMinutes,
    int MaxConcurrentBookingsPerUser,
    int BookingLookaheadDays,
    BookingVisibility BookingVisibility)
{
    // A property created before settings existed has none; these are the defaults it books with
    public static ComplexSettingsDto From(Domain.Entities.ComplexSettings? s) => s is null
        ? new ComplexSettingsDto(BookingMode.BookSpecificMachine, 60, 2, 14, BookingVisibility.ApartmentOnly)
        : new ComplexSettingsDto(s.BookingMode, s.CancellationWindowMinutes, s.MaxConcurrentBookingsPerUser, s.BookingLookaheadDays, s.BookingVisibility);
}
