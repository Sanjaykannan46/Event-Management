-- Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    rollno VARCHAR(50) UNIQUE,
    password TEXT,
    department TEXT,
    email VARCHAR(100) UNIQUE,
    phoneno BIGINT UNIQUE,
    yearofstudy INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: clubs
CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name TEXT,
    about TEXT
);

-- Table: events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    about TEXT NOT NULL,
    date DATE NOT NULL,
    event_type TEXT NOT NULL,
    venue TEXT NOT NULL,
    event_category TEXT NOT NULL,
    min_no_member INTEGER NOT NULL,
    max_no_member INTEGER NOT NULL,
    chief_guest TEXT,
    exp_expense DECIMAL(12, 2),
    tot_amt_allot_su DECIMAL(12, 2),
    tot_amt_spt_dor DECIMAL(12, 2),
    exp_no_aud INTEGER,
    faculty_obs_desig TEXT,
    faculty_obs_dept TEXT,
    poster TEXT
);

-- Table: teams
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name TEXT,
    event_id INTEGER NOT NULL,
    CONSTRAINT fk_teams_event FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Table: facultyAdvisors
CREATE TABLE facultyAdvisors (
    id SERIAL PRIMARY KEY,
    name TEXT,
    department TEXT,
    designation TEXT
);

--Table: userSecurityCode
CREATE TABLE userSecurityCode (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_userSecurityCode_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: clubMembers
CREATE TABLE clubMembers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    role TEXT,
    is_admin BOOLEAN,
    CONSTRAINT fk_clubMembers_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_clubMembers_club FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Table: eventConvenors
CREATE TABLE eventConvenors (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    CONSTRAINT fk_eventConvenors_event FOREIGN KEY (event_id) REFERENCES events(id),
    CONSTRAINT fk_eventConvenors_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_eventConvenors_club FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Table: eventRegistration
CREATE TABLE eventRegistration (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    CONSTRAINT fk_eventRegistration_event FOREIGN KEY (event_id) REFERENCES events(id),
    CONSTRAINT fk_eventRegistration_team FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Table: teamMembers
CREATE TABLE teamMembers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    is_present BOOLEAN NOT NULL,
    CONSTRAINT fk_teamMembers_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_teamMembers_team FOREIGN KEY (team_id) REFERENCES teams(id),
    CONSTRAINT fk_teamMembers_event FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Table: organizingClubs
CREATE TABLE organizingClubs (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    CONSTRAINT fk_organizingClubs_event FOREIGN KEY (event_id) REFERENCES events(id),
    CONSTRAINT fk_organizingClubs_club FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Table: feedback
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    feedback TEXT,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_feedback_event FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Table: eventWinners
CREATE TABLE eventWinners (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    position INTEGER,
    CONSTRAINT fk_eventWinners_team FOREIGN KEY (team_id) REFERENCES teams(id),
    CONSTRAINT fk_eventWinners_event FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Table: clubAdvisors
CREATE TABLE clubAdvisors (
    id SERIAL PRIMARY KEY,
    facultyAdvisor_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    CONSTRAINT fk_clubAdvisors_facultyAdvisor FOREIGN KEY (facultyAdvisor_id) REFERENCES facultyAdvisors(id),
    CONSTRAINT fk_clubAdvisors_club FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Table: invitation
CREATE TABLE invitation (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL,
    from_team_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    CONSTRAINT fk_invitation_event FOREIGN KEY (event_id) REFERENCES events(id),
    CONSTRAINT fk_invitation_from_team FOREIGN KEY (from_team_id) REFERENCES teams(id),
    CONSTRAINT fk_invitation_to_user FOREIGN KEY (to_user_id) REFERENCES users(id),
    CONSTRAINT fk_invitation_from_user FOREIGN KEY (from_user_id) REFERENCES users(id)
);

-- Table: globalAdmins
CREATE TABLE globalAdmins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Table: emailVerification
CREATE TABLE emailVerification(
    rollno VARCHAR(50) PRIMARY KEY,
    code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_teamMembers_user_id ON teamMembers(user_id);
CREATE INDEX idx_teamMembers_team_id ON teamMembers(team_id);
CREATE INDEX idx_invitation_event_id ON invitation(event_id);
CREATE INDEX idx_teams_event_id ON teams(event_id);