import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IonImageComponent } from './ion-image.component';

describe('IonImageComponent', () => {
  let component: IonImageComponent;
  let fixture: ComponentFixture<IonImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IonImageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IonImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
