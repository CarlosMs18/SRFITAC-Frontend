import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.sass']
})
export class StepperComponent implements OnInit {
  @Input() stepNames: string[] = [];
  _selectedStep: number = 1;
  selectedName: string = '';
  progressValue: number = 0;
  progressPercent: string = '';
  @Input()
  get selectedStep(): number {
    console.log("get")
    return this._selectedStep
  }
  set selectedStep(value: number) {
    console.log(value)
    this._selectedStep = value;
    if (this.stepNames.length >= value) {
      this.selectedName = this.stepNames[value - 1];
      this.progressValue = Math.round(10000 * (value - 1) / (this.stepNames.length - 1)) / 100;
      this.progressPercent = this.progressValue + '%';
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

}
