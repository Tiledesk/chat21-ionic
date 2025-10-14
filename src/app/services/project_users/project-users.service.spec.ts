import { TestBed } from '@angular/core/testing';

import { ProjectUsersService } from './project-users.service';

describe('ProjectUsersService', () => {
  let service: ProjectUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
