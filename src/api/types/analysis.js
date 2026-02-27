// Request модель
export class AnalysisRequest {
    constructor(since, until) {
        this.since = since;
        this.until = until;
    }
}

// Response модель (на основе ваших данных)
export class AnalysisResponse {
    constructor(data) {
        this.email = data.email;
        this.mergeCommits = data.mergeCommits;
        this.commits = data.commits;
        this.added = data.added;
        this.deleted = data.deleted;
        this.testAdded = data.testAdded;
    }
}

// Для преобразования дат в нужный формат
export const formatDateForRequest = (date) => {
    return date.format('YYYY-MM-DD');
};