using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Properties.DTOs;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Queries;

public record GetPropertyInfoQuery(Guid PropertyId) : IRequest<PropertyInfoDto>;

public record PropertyInfoDto(
    Guid Id,
    string Name,
    string Address,
    IReadOnlyList<BoardMemberDto> Board,
    IReadOnlyList<PropertyRoomInfoDto> Rooms,
    ComplexSettingsDto Settings);

public record BoardMemberDto(string Name, string Email);

public record PropertyRoomInfoDto(Guid Id, string Name, string? Description, IReadOnlyList<PropertyMachineInfoDto> Machines);

public record PropertyMachineInfoDto(string Name, MachineType MachineType);

// What a resident needs to know about their building, in one request: who to contact, which rooms
// and machines there are, and the booking rules.
public class GetPropertyInfoQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<GetPropertyInfoQuery, PropertyInfoDto>
{
    public async Task<PropertyInfoDto> Handle(GetPropertyInfoQuery request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.Resident, cancellationToken);

        var property = await db.Properties
            .Include(p => p.Settings)
            .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Property), request.PropertyId);

        // Only the board's contact details are shared with residents; SysAdmins run the platform,
        // they aren't the association's board
        var board = await db.UserComplexMemberships
            .Where(m => m.PropertyId == request.PropertyId && m.IsActive &&
                        (m.Role == UserRole.ComplexAdmin || m.Role == UserRole.OrgAdmin))
            .OrderBy(m => m.User.FirstName).ThenBy(m => m.User.LastName)
            .Select(m => new BoardMemberDto((m.User.FirstName + " " + m.User.LastName).Trim(), m.User.Email))
            .ToListAsync(cancellationToken);

        var rooms = await db.LaundryRooms
            .Where(r => r.PropertyId == request.PropertyId && r.IsActive)
            .OrderBy(r => r.Name)
            .Select(r => new PropertyRoomInfoDto(
                r.Id,
                r.Name,
                r.Description,
                r.Machines
                    .Where(m => m.IsActive)
                    .OrderBy(m => m.Name)
                    .Select(m => new PropertyMachineInfoDto(m.Name, m.MachineType))
                    .ToList()))
            .ToListAsync(cancellationToken);

        return new PropertyInfoDto(
            property.Id,
            property.Name,
            property.Address,
            board,
            rooms,
            ComplexSettingsDto.From(property.Settings));
    }
}
