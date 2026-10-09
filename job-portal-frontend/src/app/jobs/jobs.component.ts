import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

export type JobType = 'Full-time' | 'Remote' | 'Hybrid';
export type JobUrgencyTag = 'Actively Hiring' | 'Urgent Opening';

export interface Job {
  id: number;
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  jobType: JobType;
  skills: string[];
  postedDate: string;
  isSaved: boolean;
  urgencyTag?: JobUrgencyTag;
}

interface JobApiResponse {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  jobType: string;
  skills: string[];
  createdAt?: string;
  urgencyTag?: JobUrgencyTag;
}

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent implements OnInit {

  jobs: Job[] = [];
  errorMessage = '';
  loading = true;
  searchTerm = '';
  locationTerm = '';
  selectedJobType: JobType | '' = '';
  showingSavedJobs = false;
  savedJobIds = new Set<string>();
  userRole = localStorage.getItem('userRole') ?? 'job_seeker';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSavedJobs();
    this.getJobs();
  }

  get filteredJobs(): Job[] {
    const search = this.searchTerm.trim().toLowerCase();
    const location = this.locationTerm.trim().toLowerCase();
    const selectedType = this.selectedJobType.toLowerCase();

    return this.jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.skills.some((skill) => skill.toLowerCase().includes(search));
      const matchesLocation =
        !location || job.location.toLowerCase().includes(location);
      const matchesSaved =
        !this.showingSavedJobs || job.isSaved;

      return (
        matchesSearch &&
        matchesLocation &&
        (!selectedType || job.jobType.toLowerCase() === selectedType) &&
        matchesSaved
      );
    });
  }

  getJobs(): void {
    this.http
      .get<JobApiResponse[]>(`${environment.apiUrl}/jobs`)
      .subscribe({
        next: (response) => {
          console.log('Jobs:', response);
          this.jobs = response.map((job, index) => ({
            ...job,
            id: index + 1,
            jobType: this.normalizeJobType(job),
            postedDate: job.createdAt ?? '',
            isSaved: this.savedJobIds.has(job._id),
          }));
          this.loading = false;
        },
        error: (error) => {
          console.error('Jobs error:', error);
          this.errorMessage =
            'Jobs load nahi ho pa rahe hain';
          this.loading = false;
        }
      });
  }

  private loadSavedJobs(): void {
    const savedIds: unknown = JSON.parse(
      localStorage.getItem('savedJobIds') ?? '[]',
    );
    if (Array.isArray(savedIds)) {
      this.savedJobIds = new Set(
        savedIds.filter((id): id is string => typeof id === 'string'),
      );
    }
  }

  toggleSave(jobId: number): void {
    const job = this.jobs.find((listing) => listing.id === jobId);
    if (!job) {
      return;
    }

    if (job.isSaved) {
      this.savedJobIds.delete(job._id);
    } else {
      this.savedJobIds.add(job._id);
    }
    localStorage.setItem(
      'savedJobIds',
      JSON.stringify([...this.savedJobIds]),
    );
    this.jobs = this.jobs.map((listing) =>
      listing.id === jobId
        ? { ...listing, isSaved: !listing.isSaved }
        : listing,
    );
  }

  showAllJobs(): void {
    this.showingSavedJobs = false;
  }

  showSavedJobs(): void {
    this.showingSavedJobs = true;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.locationTerm = '';
    this.selectedJobType = '';
  }

  viewJob(jobId: string): void {
    this.router.navigate(['/jobs', jobId]);
  }

  private normalizeJobType(job: JobApiResponse): JobType {
    const normalizedType = job.jobType.toLowerCase().replace(/[-\s]/g, '');
    if (normalizedType === 'remote') {
      return 'Remote';
    }
    if (normalizedType === 'hybrid') {
      return 'Hybrid';
    }
    return 'Full-time';
  }
}