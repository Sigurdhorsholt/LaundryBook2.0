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
    IReadOnlyList<MemberDto> Members);

public record ComplexSettingsDto(
    BookingMode BookingMode,
    int CancellationWindowMinutes,
    int MaxConcurrentBookingsPerUser,
    int BookingLookaheadDays,
    BookingVisibility BookingVisibility);

public record MemberDto(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    UserRole Role,
    string? ApartmentNumber);
