import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ItemDetails } from './items.model';
import { ItemsService } from './items.service';
import { PersonService } from './person.service';

@Injectable({
  providedIn: 'root'
})
export class CoreLogicService {
  private persons: string[];
  private items: ItemDetails[];
  private directedGraph;
  private toBePaidInfo = {};
  getToBepaidInfoSubj = new Subject<String[]>();

  constructor(private personService: PersonService, private itemService: ItemsService) {

  }

  private getPersonDetails(groupId: string) {
    this.personService.fetchPersonDetails(groupId).subscribe((persons) => {
      this.persons = persons.map(person => person.name);
      this.directedGraph = [...Array(persons.length)].map(e => Array(persons.length).fill(0));
      this.constructDirectedGraph();
      this.calculateNetAmount();
      this.getToBePaidInfo();
    });
  }

  setItemDetails(items: ItemDetails[], groupId: string) {
    this.items = items;
    this.getPersonDetails(groupId);
  }

  private constructDirectedGraph() {
    for(let item of this.items) {
      if(!item.multiPerson) {
        for(let distribution of item.personsDistributedAmounts) {
          const personsName = distribution.personsName;
          const personAmount = distribution.amountOfEachPersons;
          const indexOfOwnerOfTransaction = this.persons.indexOf(item.person);
          const indexOfCurrentPerson = this.persons.indexOf(personsName);
          if(indexOfCurrentPerson !== indexOfOwnerOfTransaction) {
            this.directedGraph[indexOfCurrentPerson][indexOfOwnerOfTransaction] += personAmount;
          }
        }
      } else {
        for(let key in item.individualTransaction) {
          const individualIndex = this.persons.indexOf(key);
          const individualAmount = item.individualTransaction[key];
          const totalContributors = item.personsDistributedAmounts.length;
          for (let distribution of item.personsDistributedAmounts) {
            const personsName = distribution.personsName;
            const percentageOfContribution = ( distribution.amountOfEachPersons / item.amount ); 
            const personAmount = individualAmount * percentageOfContribution;
            const indexOfCurrentPerson = this.persons.indexOf(personsName);
            if (indexOfCurrentPerson !== individualIndex) {
              this.directedGraph[indexOfCurrentPerson][individualIndex] += personAmount;
            }
          }
        }
      }
    }
  }

  private calculateNetAmount() {
    let length = this.directedGraph[0].length;
    let netAmount = Array(length).fill(0);
    for(let fromPerson = 0; fromPerson < length; fromPerson++) {
      for(let toPerson = 0; toPerson < length; toPerson++) {
        netAmount[fromPerson] += (this.directedGraph[toPerson][fromPerson] - this.directedGraph[fromPerson][toPerson]);
      }
    }
    this.toBePaidInfo = {};
    this.findEachToBePaid(netAmount);
  }

  private getMinIndex(netAmount: number[]) {
    let min = 0;
    for(let index in netAmount ) {
      if(netAmount[index] < netAmount[min]) {
        min = +index;
      }
    }
    return min;
  }

  private getMaxIndex(netAmount: number[]) {
    let max = 0;
    for (let index in netAmount) {
      if (netAmount[index] > netAmount[max]) {
        max = +index;
      }
    }
    return max;
  }

  private getMinOfTwo(a: number, b: number) {
    return a < b ? a : b;
  }

  private findEachToBePaid(netAmount) {
    let minIdx = this.getMinIndex(netAmount);
    let maxIdx = this.getMaxIndex(netAmount);
    if(netAmount[minIdx] === 0 && netAmount[maxIdx] === 0) {
      return;
    }
    let minValue = this.getMinOfTwo(-netAmount[minIdx], netAmount[maxIdx]);
    netAmount[minIdx] += minValue;
    netAmount[maxIdx] -= minValue;
    const personToPay  = this.persons[minIdx];
    const personToGetPaid = this.persons[maxIdx];
    if (this.toBePaidInfo[personToGetPaid] && this.toBePaidInfo[personToGetPaid][personToPay]) {
      this.toBePaidInfo[personToGetPaid][personToPay] = minValue;
    } else if (this.toBePaidInfo[personToGetPaid] && !this.toBePaidInfo[personToGetPaid][personToPay]) {
      this.toBePaidInfo[personToGetPaid][personToPay] = minValue;
    } else if(!this.toBePaidInfo[personToGetPaid]) {
      this.toBePaidInfo[personToGetPaid] = {};
      this.toBePaidInfo[personToGetPaid][personToPay] = minValue;
    }
    netAmount = netAmount.map((a) => Math.round(a));
    this.findEachToBePaid(netAmount);
  }

  getToBePaidInfo() {
    let returnVal = [];
    for(let item in this.toBePaidInfo) {
      for(let key in this.toBePaidInfo[item]) {
        const message = `${key} has to pay ${this.toBePaidInfo[item][key]} to ${item}`;
        returnVal.push(message);
      }
    }
    this.getToBepaidInfoSubj.next(returnVal);
  }

}
