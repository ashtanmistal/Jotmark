import { TestBed } from '@angular/core/testing';

import { SaveloadService } from './saveload.service';

describe('SaveloadService', () => {
  let service: SaveloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
