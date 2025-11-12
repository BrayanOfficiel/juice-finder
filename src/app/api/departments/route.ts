/**
 * API Route: /api/departments
 * GET: Récupère la liste unique des départements depuis la base MySQL
 */

import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db';

export async function GET() {
    try {
        // Récupération des départements distincts, triés
        const departments = await prisma.restaurant.findMany({
            where: {
                department: {
                    not: null,
                },
            },
            select: {
                department: true,
            },
            distinct: ['department'],
            orderBy: {
                department: 'asc',
            },
        });

        // Extraction et nettoyage
        type DepartmentRow = { department: string | null };

        const departmentList = (departments as DepartmentRow[])
            .map((d) => d.department)
            .filter((d: string | null): d is string => !!d && d.trim() !== "")
            .sort();

        return NextResponse.json({
            departments: departmentList,
            count: departmentList.length,
        });

    } catch (error) {
        console.error('Erreur API /api/departments:', error);
        return NextResponse.json(
            {error: 'Erreur lors de la récupération des départements'},
            {status: 500}
        );
    }
}

