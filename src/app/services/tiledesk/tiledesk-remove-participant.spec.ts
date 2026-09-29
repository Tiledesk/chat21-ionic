import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TiledeskService } from './tiledesk.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';

describe('TiledeskService removeParticipant', () => {
  let service: TiledeskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    LoggerInstance.setInstance({ log: () => {}, debug: () => {}, info: () => {}, warn: () => {}, error: () => {} } as any);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TiledeskService,
        { provide: AppStorageService, useValue: { getItem: () => 'JWT tok' } }
      ]
    });
    service = TestBed.inject(TiledeskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('issues one authorized DELETE on the participant of the request', () => {
    service.initialize('https://api.test/');
    service.removeParticipant('support-group-p1-abc', 'u1', 'p1').subscribe();
    const req = httpMock.expectOne('https://api.test/p1/requests/support-group-p1-abc/participants/u1');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('JWT tok');
    req.flush({});
  });
});
