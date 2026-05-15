import prisma from '../../prisma.js';

/**
 * Retrieves the club ID for the given event.
 * @param event_id - The ID of the event.
 * @returns A Promise resolving to the club_id or undefined.
 */
export async function get_club_id(event_id: number): Promise<number | undefined> {
    const organizingClub = await prisma.organizingclubs.findFirst({
        where: { event_id : Number(event_id) },
        select: { club_id: true }
    });
    return organizingClub?.club_id;
}