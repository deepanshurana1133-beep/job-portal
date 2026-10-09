import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { UpdateJobComponent } from './update-job.component';

describe('UpdateJobComponent', () => {
  let component: UpdateJobComponent;
  let fixture: ComponentFixture<UpdateJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateJobComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
