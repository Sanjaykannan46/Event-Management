//interface for updating event details
export interface UpdateEventDto {
    name?: string;
    about?: string;
    date?: Date | string;
    event_type?: string;
    event_category?: string;
    min_no_member?: number;
    max_no_member?: number;
    venue?: string;
}

export interface WinnerDetails{
    event_id:number,
    team_id:number,
    position:number
}

export interface DeleteWinners{
    event_id:number;
    position:number;
}
export interface club{
    club_id:number;
}

interface TeamMember{
    name: string|null;
    rollno: string|null;
    department: string|null;
    yearofstudy: number|null;
}

export interface RegistrationData{
    team_id: number|null;
    team_name: string|null;
    members: TeamMember[]
}