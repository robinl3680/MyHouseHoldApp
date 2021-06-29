
export interface ItemDetails {
    item: string,
    amount: number,
    date: Date | string,
    person: string,
    key?: string,
    personsDistributedAmounts: PersonsDistributedAmounts[],
    multiPerson?: boolean,
    individualTransaction?: {}
    // details?: string
}

export interface PersonsDistributedAmounts{
    personsName: string;
    amountOfEachPersons: number; 
}