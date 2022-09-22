import { Component, OnInit } from '@angular/core';
import { ImageComponent } from '../../message/image/image.component';

@Component({
  selector: 'app-ion-image',
  templateUrl: './ion-image.component.html',
  styleUrls: ['./ion-image.component.scss'],
})
export class IonImageComponent extends ImageComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {}

}
