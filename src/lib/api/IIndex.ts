export interface IIndex {
    add(element: string): void;

    search(query: string, limit?: number): Promise<string[]>;
}

