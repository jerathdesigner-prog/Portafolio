import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EMPTY_PORTFOLIO } from '../constants/portfolio.constants';
import type { PublicPortfolio } from '../interfaces/portfolio.interface';
import { PortfolioService } from './portfolio.service';

const CONTENT: PublicPortfolio = {
  media: [],
  projects: [],
  services: [{ id: 'srv_diseno', title: 'Diseño gráfico' }],
};

describe('PortfolioService', () => {
  let service: PortfolioService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PortfolioService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    delete window.jmPortfolioData;
    controller.verify();
  });

  it('uses the content embedded by the Worker without a request', () => {
    window.jmPortfolioData = CONTENT;
    let result: PublicPortfolio | undefined;

    service.load().subscribe((content) => (result = content));

    expect(result).toBe(CONTENT);
  });

  it('loads /api/public when nothing is embedded', () => {
    let result: PublicPortfolio | undefined;

    service.load().subscribe((content) => (result = content));
    controller.expectOne('/api/public').flush(CONTENT);

    expect(result).toEqual(CONTENT);
  });

  it('falls back to empty content when /api/public fails', () => {
    let result: PublicPortfolio | undefined;

    service.load().subscribe((content) => (result = content));
    controller
      .expectOne('/api/public')
      .flush('down', { status: 503, statusText: 'Unavailable' });

    expect(result).toEqual(EMPTY_PORTFOLIO);
  });
});
