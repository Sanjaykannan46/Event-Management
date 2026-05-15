export interface CreateClubDTO {
    name: string;
    about?: string;
}

export interface AddClubAdminDTO {
    rollno: string;
    club_id: number;
    role?: string;
}