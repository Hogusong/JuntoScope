import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

enum SELECTED_RESULT {
  AVG_RESULT = "avg",
  MAX_RESULT = "max",
  CUSTOM_RESULT = "custom"
}

@Component({
  selector: "app-select-result",
  templateUrl: "./select-result.component.html"
})
export class SelectResultComponent implements OnInit {
  SELECTED_RESULT = SELECTED_RESULT;
  selectionForm: FormGroup;

  @Input() avg: number;

  @Input() max: number;

  selectedResult: SELECTED_RESULT;

  @Output() estimate = new EventEmitter<number>();

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.selectionForm = this.fb.group({
      custom: ["", Validators.required]
    });
  }

  selectAvg() {
    this.selectedResult = SELECTED_RESULT.AVG_RESULT;
    this.estimate.emit(this.avg);
  }

  selectMax() {
    this.selectedResult = SELECTED_RESULT.MAX_RESULT;
    this.estimate.emit(this.max);
  }

  onChangeValue(ev) {
    if (parseInt(ev.value) < 99) {
      this.selectedResult = SELECTED_RESULT.CUSTOM_RESULT;
      this.estimate.emit(parseInt(ev.value, 10));
    }
  }
}
