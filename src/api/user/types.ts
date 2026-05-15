
export interface FetchTeamMembersRequest {
    event_id: number;
}

export interface TeamMemberInfo {
    id: number;
    name: string | null;
    email: string | null;
    rollno: string | null;
    department: string | null;
    yearofstudy: number | null;
}

export interface FetchTeamMembersResponse {
    team_id: number;
    members: TeamMemberInfo[];
}

export interface RemoveTeamMemberRequest {
    event_id: number;
    user_id: number;
}

export interface RemoveTeamMemberResponse {
    message: string;
}
export interface TeamInvite {
    from_team_id: number;
    to_user_id:number;
    event_id: number;
}
export interface GetUserIdByRollNoRequest {
    rollno: string;
}

export interface GetUserIdByRollNoResponse {
    user_id: number;
}
export interface Feedback{
    event_id: number;
    feedback: string;
    rating: number;
}
export interface UpdateProfileRequest {
    name?: string;
    department?: string;
    email?: string;
    phoneno?: string;
    yearofstudy?: number;
}

export interface UpdateProfileResponse {
    message: string;
    profile?: {
        name: string | null;
        rollno: string | null;
        department: string | null;
        email: string | null;
        phoneno: string | null;
        yearofstudy: number | null;
    };
}

export interface EventRegistration {
    event_id: number;
    teamName: string ;
}
export interface ClubMember {
    club_id: number;
    role: string|null;
}

export interface Club  {
    name: string | null;
    id: number;
}

export interface MembershipDetails{
    name:string|null;
    id:number;
    role:string|null;
}

export interface Invite{
    event_id:number;
    from_user_id:number;
    from_team_id:number;
}

export interface EventListItem {
    id: number;
    name: string | null;
    about: string | null;
    date: Date | null;
    venue: string | null;
    event_type: string | null;
    event_category: string | null;
    min_no_member: number | null;
    max_no_member: number | null;
    club_name: string | null;
    status: 'past' | 'ongoing' | 'upcoming';
}

export interface EventsResponse {
    past: EventListItem[];
    ongoing: EventListItem[];
    upcoming: EventListItem[];
}