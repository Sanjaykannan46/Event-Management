-- Drop dependent tables first (tables with foreign keys)
DROP TABLE IF EXISTS clubAdvisors;
DROP TABLE IF EXISTS eventAttendance;
DROP TABLE IF EXISTS eventWinners;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS organizingClubs;
DROP TABLE IF EXISTS teamMembers;
DROP TABLE IF EXISTS eventRegistration;
DROP TABLE IF EXISTS eventConvenors;
DROP TABLE IF EXISTS invitation;
DROP TABLE IF EXISTS clubmembers;
DROP TABLE IF EXISTS userSecurityCode;

-- Drop independent tables last
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS facultyAdvisors;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS globalAdmins;
DROP TABLE IF EXISTS emailVerification;

-- Truncating Tables
BEGIN;

-- First truncate tables with foreign key dependencies
TRUNCATE TABLE invitation, clubAdvisors, eventAttendance, eventWinners,
             feedback, organizingClubs, teamMembers, eventRegistration,
             eventConvenors, clubMembers, userSecurityCode CASCADE;

-- Then truncate base tables
TRUNCATE TABLE facultyAdvisors, teams, events, clubs, users CASCADE;

COMMIT;