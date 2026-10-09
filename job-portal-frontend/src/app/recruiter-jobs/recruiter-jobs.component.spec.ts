import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { RecruiterJobsComponent } from './recruiter-jobs.component';

describe('RecruiterJobsComponent', () => {
  let component: RecruiterJobsComponent;
  let fixture: ComponentFixture<RecruiterJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterJobsComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruiterJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
