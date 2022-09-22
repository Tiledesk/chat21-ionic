import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IonBubbleMessageComponent } from "./IonBubbleMessageComponent";

describe('IonBubbleMessageComponent', () => {
  let component: IonBubbleMessageComponent;
  let fixture: ComponentFixture<IonBubbleMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IonBubbleMessageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IonBubbleMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
