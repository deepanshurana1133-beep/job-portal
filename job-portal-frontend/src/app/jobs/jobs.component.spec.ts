import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { environment } from '../../environments/environment';
import { JobsComponent } from './jobs.component';

describe('JobsComponent', () => {
  let component: JobsComponent;
  let fixture: ComponentFixture<JobsComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpTestingController
      .expectOne(`${environment.apiUrl}/jobs`)
      .flush([]);
  });

  afterEach(() => httpTestingController.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
