
export interface ItemDetails {
    item: string,
    amount: number,
    date: Date,
    person: string,
    key?: string,
    personsDistributedAmounts: PersonsDistributedAmounts[],
    // details?: string
}

export interface PersonsDistributedAmounts{
    personsName: string;
    amountOfEachPersons: number; 
}