export interface IIndex {
    /**
     * Adds an element to the index.
     *
     * @param element string to be added
     */
    add(element: string): void;

    /**
     * Searches for a list of elements matching the query.
     *
     * @param query string to be used for search.
     * @param limit number to limit the max number of results.
     */
    search(query: string, limit?: number): Promise<string[]>;

    /**
     * Removes all elements from the index.
     */
    clear(): void;
}

