-- CreateTable
CREATE TABLE "clubadvisors" (
    "id" SERIAL NOT NULL,
    "facultyadvisor_id" INTEGER NOT NULL,
    "club_id" INTEGER NOT NULL,

    CONSTRAINT "clubadvisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubmembers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "club_id" INTEGER NOT NULL,
    "role" TEXT,
    "is_admin" BOOLEAN,

    CONSTRAINT "clubmembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "about" TEXT,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emailverification" (
    "rollno" VARCHAR(50) NOT NULL,
    "code" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emailverification_pkey" PRIMARY KEY ("rollno")
);

-- CreateTable
CREATE TABLE "eventconvenors" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "club_id" INTEGER NOT NULL,

    CONSTRAINT "eventconvenors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventregistration" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,

    CONSTRAINT "eventregistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "event_type" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "event_category" TEXT NOT NULL,
    "min_no_member" INTEGER NOT NULL,
    "max_no_member" INTEGER NOT NULL,
    "chief_guest" TEXT,
    "exp_expense" DECIMAL(12,2),
    "tot_amt_allot_su" DECIMAL(12,2),
    "tot_amt_spt_dor" DECIMAL(12,2),
    "exp_no_aud" INTEGER,
    "faculty_obs_desig" TEXT,
    "faculty_obs_dept" TEXT,
    "poster" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventwinners" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "position" INTEGER,

    CONSTRAINT "eventwinners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facultyadvisors" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "department" TEXT,
    "designation" TEXT,

    CONSTRAINT "facultyadvisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "feedback" TEXT,
    "rating" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "globaladmins" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "globaladmins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" SERIAL NOT NULL,
    "from_user_id" INTEGER NOT NULL,
    "from_team_id" INTEGER NOT NULL,
    "to_user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizingclubs" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "club_id" INTEGER NOT NULL,

    CONSTRAINT "organizingclubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teammembers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "is_present" BOOLEAN NOT NULL,

    CONSTRAINT "teammembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "rollno" VARCHAR(50),
    "password" TEXT,
    "department" TEXT,
    "email" VARCHAR(100),
    "phoneno" BIGINT,
    "yearofstudy" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usersecuritycode" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usersecuritycode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "globaladmins_username_key" ON "globaladmins"("username");

-- CreateIndex
CREATE INDEX "idx_invitation_event_id" ON "invitation"("event_id");

-- CreateIndex
CREATE INDEX "idx_teammembers_team_id" ON "teammembers"("team_id");

-- CreateIndex
CREATE INDEX "idx_teammembers_user_id" ON "teammembers"("user_id");

-- CreateIndex
CREATE INDEX "idx_teams_event_id" ON "teams"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_rollno_key" ON "users"("rollno");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneno_key" ON "users"("phoneno");

-- CreateIndex
CREATE UNIQUE INDEX "usersecuritycode_user_id_key" ON "usersecuritycode"("user_id");

-- AddForeignKey
ALTER TABLE "clubadvisors" ADD CONSTRAINT "fk_clubadvisors_club" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clubadvisors" ADD CONSTRAINT "fk_clubadvisors_facultyadvisor" FOREIGN KEY ("facultyadvisor_id") REFERENCES "facultyadvisors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clubmembers" ADD CONSTRAINT "fk_clubmembers_club" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clubmembers" ADD CONSTRAINT "fk_clubmembers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventconvenors" ADD CONSTRAINT "fk_eventconvenors_club" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventconvenors" ADD CONSTRAINT "fk_eventconvenors_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventconvenors" ADD CONSTRAINT "fk_eventconvenors_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventregistration" ADD CONSTRAINT "fk_eventregistration_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventregistration" ADD CONSTRAINT "fk_eventregistration_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventwinners" ADD CONSTRAINT "fk_eventwinners_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventwinners" ADD CONSTRAINT "fk_eventwinners_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "fk_feedback_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "fk_feedback_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "fk_invitation_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "fk_invitation_from_team" FOREIGN KEY ("from_team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "fk_invitation_from_user" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "fk_invitation_to_user" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organizingclubs" ADD CONSTRAINT "fk_organizingclubs_club" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organizingclubs" ADD CONSTRAINT "fk_organizingclubs_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teammembers" ADD CONSTRAINT "fk_teammembers_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teammembers" ADD CONSTRAINT "fk_teammembers_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teammembers" ADD CONSTRAINT "fk_teammembers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "fk_teams_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usersecuritycode" ADD CONSTRAINT "fk_usersecuritycode_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
