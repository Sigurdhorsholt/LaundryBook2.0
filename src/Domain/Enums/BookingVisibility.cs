namespace Domain.Enums;

public enum BookingVisibility
{
    FullName = 0,        // Show booker's full name to other residents
    ApartmentOnly = 1,   // Show only apartment number (default)
    Anonymous = 2,       // Show only "Optaget" — maximally private
}
