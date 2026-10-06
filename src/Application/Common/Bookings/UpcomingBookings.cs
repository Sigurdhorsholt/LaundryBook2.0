using Application.Common.Time;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Common.Bookings;

public static class UpcomingBookings
{
    public static IQueryable<Booking> WhereUpcoming(this IQueryable<Booking> bookings)
    {
        var today = CopenhagenTime.Today;
        return bookings.Where(b => b.Date >= today && b.Status == BookingStatus.Active);
    }

    // Only marks the bookings; the caller's SaveChanges commits them together with its own change.
    public static async Task<int> CancelUpcomingByAdminAsync(this IQueryable<Booking> bookings, CancellationToken cancellationToken)
    {
        var affected = await bookings.WhereUpcoming().ToListAsync(cancellationToken);
        var now = DateTime.UtcNow;
        foreach (var booking in affected)
        {
            booking.Status = BookingStatus.CancelledByAdmin;
            booking.CancelledAt = now;
        }
        return affected.Count;
    }
}
