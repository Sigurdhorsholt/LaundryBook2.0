using Domain.Enums;

namespace Application.Features.Auth.DTOs;

public record CurrentUserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    IReadOnlyList<UserComplexMembershipDto> Memberships);

public record UserComplexMembershipDto(
    Guid PropertyId,
    string PropertyName,
    UserRole Role,
    string? ApartmentNumber);
