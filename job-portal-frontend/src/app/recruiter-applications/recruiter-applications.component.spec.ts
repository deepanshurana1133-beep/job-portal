import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../environments/environment';
import { RecruiterApplicationsComponent } from './recruiter-applications.component';

describe('RecruiterApplicationsComponent', () => {
  let httpTestingController: HttpTestingController;
  let component: RecruiterApplicationsComponent;

  beforeEach(() => {
    localStorage.setItem('accessToken', 'test-token');

    TestBed.configureTestingModule({
      imports: [
        RecruiterApplicationsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(RecruiterApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpTestingController
      .expectOne(`${environment.apiUrl}/applications/recruiter`)
      .flush([]);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('accessToken');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends only the selected status and reports email delivery failure', () => {
    component.updateStatus('application-id', 'Accepted');

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/applications/application-id/status`,
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'Accepted' });

    request.flush({ status: 'Accepted', emailSent: false });
    httpTestingController
      .expectOne(`${environment.apiUrl}/applications/recruiter`)
      .flush([]);

    expect(component.successMessage).toContain('accepted successfully');
    expect(component.successMessage).toContain(
      'applicant notification email could not be sent',
    );
  });

  it('shows an error when the status update fails', () => {
    component.updateStatus('application-id', 'Rejected');

    httpTestingController
      .expectOne(`${environment.apiUrl}/applications/application-id/status`)
      .flush(
        { message: 'Unable to update application' },
        { status: 500, statusText: 'Internal Server Error' },
      );

    expect(component.errorMessage).toBe('Unable to update application');
  });
});
