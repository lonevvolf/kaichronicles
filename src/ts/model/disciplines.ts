import { BookSeriesId, KaiDiscipline, MgnDiscipline, GndDiscipline } from "..";

/**
 * Disciplines helpers
 */
export class Disciplines {

    /**
     * Gets all Discipline IDs for a given enum
     * @param disciplinesEnum The Disciplines enumeration
     * @returns An Array of DisciplineId strings from the enum 
     */
    private static getDisciplinesIds(disciplinesEnum: any): string[] {
        const result = [];
        for (const disciplineKey of Object.keys(disciplinesEnum)) {
            result.push(disciplinesEnum[disciplineKey]);
        }
        return result;
    }

    /**
     * Returns all disciplines ids for the given book series
     * @param seriesId The BookSeriesId to get the DisciplineIds for
     * @returns An Array of DisciplineId strings belonging to the given series
     */
    public static getSeriesDisciplines(seriesId: BookSeriesId): string[] {
        switch (seriesId) {
            case BookSeriesId.Kai:
                return Disciplines.getDisciplinesIds(KaiDiscipline);
            case BookSeriesId.Magnakai:
                return Disciplines.getDisciplinesIds(MgnDiscipline);
            case BookSeriesId.GrandMaster:
                return Disciplines.getDisciplinesIds(GndDiscipline);
            default:
                return [];
        }
    }

    /**
     * Returns discipline ids for this and all previous book series
     * @param seriesId The highest BookSeriesId to get the DisciplineIds for
     * @returns An Array of DisciplineId string belonging to the given series and all those before it
     */
    public static getAllPossibleDisciplines(seriesId: BookSeriesId): string[] {
        const result = [];

        switch (seriesId) {
            case BookSeriesId.GrandMaster:
                Disciplines.getDisciplinesIds(GndDiscipline).forEach(val => result.push(val));
                // No break on purpose
            case BookSeriesId.Magnakai:
                Disciplines.getDisciplinesIds(MgnDiscipline).forEach(val => result.push(val));
                // No break on purpose
            case BookSeriesId.Kai:
                Disciplines.getDisciplinesIds(KaiDiscipline).forEach(val => result.push(val));
                // No break on purpose
            default:
                return result;
        }

        return result;
    }
}
