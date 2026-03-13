-- ============================================================
-- LaundryBook2.0 — Development Seed Data
-- Run against: laundrybookdb (PostgreSQL)
-- Existing user: 9e0cab72-e7ed-49c5-aaad-f6466430a292
-- ============================================================

-- Enum values (EF Core stores as int):
--   UserRole:      Resident=0, ComplexAdmin=1, OrgAdmin=2, SysAdmin=3
--   BookingMode:   BookEntireRoom=0, BookSpecificMachine=1
--   BookingStatus: Active=0, CancelledByUser=1, CancelledByAdmin=2
--   MachineType:   Washer=0, Dryer=1, WasherDryer=2

-- ============================================================
-- PROPERTIES
-- ============================================================

begin transaction;
INSERT INTO "Properties" ("Id", "Name", "Address", "CreatedAt", "UpdatedAt")
VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Fælledvej 12', 'Fælledvej 12, 2200 København N', NOW() AT TIME ZONE 'UTC', NULL),
    ('a1000000-0000-0000-0000-000000000002', 'Solsiden 8',   'Solsiden 8, 2300 København S',   NOW() AT TIME ZONE 'UTC', NULL);

-- ============================================================
-- COMPLEX SETTINGS (1:1 with Property)
-- ============================================================
INSERT INTO "ComplexSettings" ("PropertyId", "BookingMode", "CancellationWindowMinutes", "MaxConcurrentBookingsPerUser", "CreatedAt", "UpdatedAt")
VALUES
    ('a1000000-0000-0000-0000-000000000001', 1, 60,  2, NOW() AT TIME ZONE 'UTC', NULL),  -- BookSpecificMachine
    ('a1000000-0000-0000-0000-000000000002', 0, 120, 3, NOW() AT TIME ZONE 'UTC', NULL);  -- BookEntireRoom

-- ============================================================
-- USER MEMBERSHIPS
-- (existing user gets SysAdmin on property 1, Resident on property 2)
-- ============================================================
INSERT INTO "UserComplexMemberships" ("UserId", "PropertyId", "Role", "ApartmentNumber", "JoinedAt", "CreatedAt", "UpdatedAt")
VALUES
    ('9e0cab72-e7ed-49c5-aaad-f6466430a292', 'a1000000-0000-0000-0000-000000000001', 3, NULL,  NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC', NULL),  -- SysAdmin
    ('9e0cab72-e7ed-49c5-aaad-f6466430a292', 'a1000000-0000-0000-0000-000000000002', 0, '4B',  NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC', NULL);  -- Resident

-- ============================================================
-- LAUNDRY ROOMS
-- ============================================================
INSERT INTO "LaundryRooms" ("Id", "PropertyId", "Name", "Description", "IsActive", "CreatedAt", "UpdatedAt")
VALUES
    ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Vaskekælder A', 'Kælderrum mod gaden',   TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Vaskekælder B', 'Kælderrum mod gården',  TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Fælles Vask',   'Stueplan ved indgangen', TRUE, NOW() AT TIME ZONE 'UTC', NULL);

-- ============================================================
-- LAUNDRY MACHINES
-- Room A: 2 washers + 1 dryer
-- Room B: 1 washer + 1 dryer
-- Room (property 2): 1 WasherDryer
-- ============================================================
INSERT INTO "LaundryMachines" ("Id", "LaundryRoomId", "Name", "MachineType", "IsActive", "CreatedAt", "UpdatedAt")
VALUES
    -- Vaskekælder A
    ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Vaskemaskine 1', 0, TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Vaskemaskine 2', 0, TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Tørretumbler 1', 1, TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    -- Vaskekælder B
    ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Vaskemaskine 3', 0, TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'Tørretumbler 2', 1, TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    -- Fælles Vask (property 2)
    ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', 'Vask/Tørr 1',    2, TRUE, NOW() AT TIME ZONE 'UTC', NULL);

-- ============================================================
-- TIME SLOT TEMPLATES
-- Vaskekælder A & B: 4 slots each (07-10, 10-13, 13-16, 16-19)
-- Fælles Vask: 3 slots (08-11, 11-14, 14-17)
-- ============================================================
INSERT INTO "TimeSlotTemplates" ("Id", "LaundryRoomId", "StartTime", "EndTime", "IsActive", "CreatedAt", "UpdatedAt")
VALUES
    -- Vaskekælder A
    ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '07:00', '10:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '10:00', '13:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', '13:00', '16:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('d1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', '16:00', '19:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    -- Vaskekælder B
    ('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', '07:00', '10:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('d1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', '10:00', '13:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('d1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000002', '13:00', '16:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('d1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000002', '16:00', '19:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    -- Fælles Vask
    ('d1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000003', '08:00', '11:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('d1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000003', '11:00', '14:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL),
    ('d1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000003', '14:00', '17:00', TRUE, NOW() AT TIME ZONE 'UTC', NULL);

-- ============================================================
-- BOOKINGS
-- Mix of: upcoming, today, past, and one cancelled
-- User books machines in Vaskekælder A (BookSpecificMachine mode)
-- ============================================================
INSERT INTO "Bookings" ("Id", "UserId", "LaundryRoomId", "TimeSlotTemplateId", "MachineId", "Date", "Status", "CancelledAt", "CreatedAt", "UpdatedAt")
VALUES
    -- Today morning — Vaskemaskine 1
    ('e1000000-0000-0000-0000-000000000001',
     '9e0cab72-e7ed-49c5-aaad-f6466430a292',
     'b1000000-0000-0000-0000-000000000001',
     'd1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000001',
     '2026-03-13', 0, NULL, NOW() AT TIME ZONE 'UTC', NULL),

    -- Today afternoon — Tørretumbler 1
    ('e1000000-0000-0000-0000-000000000002',
     '9e0cab72-e7ed-49c5-aaad-f6466430a292',
     'b1000000-0000-0000-0000-000000000001',
     'd1000000-0000-0000-0000-000000000003',
     'c1000000-0000-0000-0000-000000000003',
     '2026-03-13', 0, NULL, NOW() AT TIME ZONE 'UTC', NULL),

    -- Tomorrow morning — Vaskemaskine 2
    ('e1000000-0000-0000-0000-000000000003',
     '9e0cab72-e7ed-49c5-aaad-f6466430a292',
     'b1000000-0000-0000-0000-000000000001',
     'd1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000002',
     '2026-03-14', 0, NULL, NOW() AT TIME ZONE 'UTC', NULL),

    -- Next week — Vaskekælder B, Vaskemaskine 3
    ('e1000000-0000-0000-0000-000000000004',
     '9e0cab72-e7ed-49c5-aaad-f6466430a292',
     'b1000000-0000-0000-0000-000000000002',
     'd1000000-0000-0000-0000-000000000006',
     'c1000000-0000-0000-0000-000000000004',
     '2026-03-20', 0, NULL, NOW() AT TIME ZONE 'UTC', NULL),

    -- Past booking — last week, Active (completed)
    ('e1000000-0000-0000-0000-000000000005',
     '9e0cab72-e7ed-49c5-aaad-f6466430a292',
     'b1000000-0000-0000-0000-000000000001',
     'd1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000001',
     '2026-03-06', 0, NULL, NOW() AT TIME ZONE 'UTC', NULL),

    -- Past booking — cancelled by user
    ('e1000000-0000-0000-0000-000000000006',
     '9e0cab72-e7ed-49c5-aaad-f6466430a292',
     'b1000000-0000-0000-0000-000000000001',
     'd1000000-0000-0000-0000-000000000004',
     'c1000000-0000-0000-0000-000000000002',
     '2026-03-10', 1, '2026-03-09 14:30:00+00', NOW() AT TIME ZONE 'UTC', NULL);

commit transaction; 
