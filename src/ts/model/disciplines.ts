import { BookSeriesId, KaiDiscipline, MgnDiscipline, GndDiscipline, NewOrderDiscipline } from "..";

/**
 * Disciplines helpers
 */
export class Disciplines {

    private static getDisciplinesIds(disciplinesEnum: any): string[] {
        const result: string[] = [];
        for (const disciplineKey of Object.keys(disciplinesEnum)) {
            result.push(disciplinesEnum[disciplineKey]);
        }
        return result;
    }

    /** Returns all disciplines ids for the  given book series */
    public static getSeriesDisciplines(seriesId: BookSeriesId): string[] {
        switch (seriesId) {
            case BookSeriesId.Kai:
                return Disciplines.getDisciplinesIds(KaiDiscipline);
            case BookSeriesId.Magnakai:
                return Disciplines.getDisciplinesIds(MgnDiscipline);
            case BookSeriesId.GrandMaster:
                return Disciplines.getDisciplinesIds(GndDiscipline);
            case BookSeriesId.NewOrder:
                return Disciplines.getDisciplinesIds(NewOrderDiscipline);
            default:
                return [];
        }
    }
}
