export interface CreateEventDTO {
    name: string;
    about: string;
    date: string;
    event_type: string;
    venue: string;
    event_category: string;
    min_no_member: number;
    max_no_member: number;
    club_id: number;
    eventConvenors?: string[];
    chief_guest: string | null;
    exp_expense: number | null;
    tot_amt_allot_su: number | null;
    tot_amt_spt_dor: number | null;
    exp_no_aud: number | null;
    faculty_obs_desig: string | null;
    faculty_obs_dept: string | null;
}
// Add this to your types.ts file
export interface ClubMemberDTO {
    id: number;
    name: string | null;
    rollno: string | null;
    department: string | null;
    yearofstudy: number | null;
    role: string;
}
export interface RemoveClubMemberResponse {
    message: string;
    errors?: Array<{
        rollno: string;
        status: string;
        message: string;
    }>;
}
export interface UpdateEventPosterResponse {
    message: string;
    posterPath?: string;
}
export interface GetClubMembersResponse {
    message: string;
    data: ClubMemberDTO[];
}

export interface Attendance {
    user_id : number,
    event_id : number,
    is_present : boolean,
}

export interface EventConvenor {
    name: string | null;
    department: string | null;
    yearofstudy: number | null;
}

export interface EventWinner {
    position: number | null;
    team_name: string | null | undefined;
}

export interface PastEventData {
    name: string | null;
    about: string | null;
    date: Date | null;
    event_type: string | null;
    event_category: string | null;
    eventConvenors: EventConvenor[];
    eventWinners: EventWinner[];
    average_rating: number;
    total_registered_teams: number;
    total_attendance: number;
}

export interface PastEventsResponse {
    message: string;
    data: PastEventData[];
}

export interface FeedbackItem {
    id: number;
    created_at: Date | null;
    feedback: string | null;
    user_id: number;
    event_id: number;
    rating: number | null;
}

export interface PrismaEvent {
    name: string | null;
    about: string | null;
    date: Date | null;
    venue: string | null;
    event_type: string | null;
    event_category: string | null;
    eventconvenors: {
        users: {
            name: string | null;
            department: string | null;
            yearofstudy: number | null;
        } | null;
        id: number;
        club_id: number;
        user_id: number;
        event_id: number;
    }[];
    eventwinners: {
        id: number;
        team_id: number;
        event_id: number;
        position: number | null;
        teams?: {
            name: string | null;
        } | null;
    }[];
    feedback: FeedbackItem[];
    eventregistration: any[];
    teammembers: any[];
    id?: number;
}

export interface ClubMembers {
    members: {
        rollno: string;
        role?: string;
    }[];
}

export interface EventDetails {
    name: string | null;
    about: string | null;
    date: Date | null;
    venue: string | null;
    event_type: string | null;
    event_category: string | null;
}

export interface EventDetailsResponse {
    message: string;
    data: EventDetails[];
}
