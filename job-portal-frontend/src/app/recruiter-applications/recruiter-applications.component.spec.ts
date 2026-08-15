import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterApplicationsComponent } from './recruiter-applications.component';

describe('RecruiterApplicationsComponent', () => {
  let component: RecruiterApplicationsComponent;
  let fixture: ComponentFixture<RecruiterApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruiterApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
