namespace Application.Common.Exceptions;

// The frontend maps these to translated messages (errors.<code> in its locale files),
// so a code must never change meaning once it has shipped.
public static class ErrorCodes
{
    public const string ValidationFailed = "validation_failed";
    public const string NotFound = "not_found";
    public const string Forbidden = "forbidden";
    public const string Unauthorized = "unauthorized";
    public const string Unexpected = "unexpected";

    public const string SlotTaken = "slot_taken";
    public const string MachineTaken = "machine_taken";
    public const string MachineRequired = "machine_required";
    public const string SlotPassed = "slot_passed";
    public const string OutsideBookingWindow = "outside_booking_window";
    public const string MaxBookingsReached = "max_bookings_reached";
    public const string BookingAlreadyCancelled = "booking_already_cancelled";
    public const string CancelWindowPassed = "cancel_window_passed";

    public const string SlotOverlap = "slot_overlap";
    public const string SlotDuplicate = "slot_duplicate";
    public const string BookingModeLocked = "booking_mode_locked";

    public const string PropertyPendingApproval = "property_pending_approval";
    public const string LastAdmin = "last_admin";
    public const string CannotRemoveSelf = "cannot_remove_self";
    public const string CannotDemoteSelf = "cannot_demote_self";
    public const string RoleTooHigh = "role_too_high";
    public const string RoleGrantTooHigh = "role_grant_too_high";
    public const string InviteEmailMismatch = "invite_email_mismatch";
    public const string NotSignedIn = "not_signed_in";
}
