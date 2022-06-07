import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  @Input('title') title;
  @Input('buttonTitle') buttonTitle;
  @Input('section') section;
  @Output('activeSection') activeSection: EventEmitter<string> = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }

  changeActiveSection() {
    this.activeSection.emit(this.section);
  }

}
