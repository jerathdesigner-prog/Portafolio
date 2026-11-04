import { TestBed } from '@angular/core/testing';

import type {
  PortfolioServiceItem,
  PublicPortfolio,
} from '../../interfaces/portfolio.interface';
import { ServicePanelComponent } from './service-panel.component';

const DESIGN: PortfolioServiceItem = {
  id: 'srv_diseno',
  slug: 'diseno',
  subtitle: 'De una idea a una pieza que destaca.',
  tag: 'FORMATOS',
  title: 'Diseño gráfico',
};

function render(content: PublicPortfolio, service = DESIGN): HTMLElement {
  const fixture = TestBed.createComponent(ServicePanelComponent);
  fixture.componentRef.setInput('content', content);
  fixture.componentRef.setInput('number', 1);
  fixture.componentRef.setInput('service', service);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('ServicePanelComponent', () => {
  it('renders number, title, the first project as sample and every project', () => {
    const element = render({
      media: [],
      projects: [
        { id: 'pr_a', serviceId: 'srv_diseno', title: 'Flyers' },
        { id: 'pr_b', serviceId: 'srv_diseno', title: 'Posters' },
        { id: 'pr_x', serviceId: 'srv_other', title: 'Ajeno' },
      ],
      services: [DESIGN],
    });

    expect(element.querySelector('.panel-number')?.textContent).toBe('01');
    expect(element.querySelector('h3')?.textContent).toBe('Diseño gráfico');
    const sample = element.querySelector('.sample-button');
    expect(sample?.getAttribute('data-service')).toBe('pr_a');
    expect(sample?.querySelector('.flyer-art')).not.toBeNull();
    expect(sample?.querySelector('.sample-caption')?.textContent).toBe(
      'FORMATOS',
    );
    const list = [...element.querySelectorAll('.service-list button')];
    expect(list.map((b) => b.getAttribute('data-service'))).toEqual([
      'pr_a',
      'pr_b',
    ]);
  });

  it('uses the uploaded cover image instead of the legacy art', () => {
    const element = render(
      {
        media: [{ id: 'med_1', kind: 'image', url: '/uploads/a.png' }],
        projects: [{ id: 'pr_a', serviceId: 'srv_diseno', title: 'Flyers' }],
        services: [{ ...DESIGN, coverMediaId: 'med_1' }],
      },
      { ...DESIGN, coverMediaId: 'med_1' },
    );

    expect(element.querySelector('.artwork img')?.getAttribute('src')).toBe(
      '/uploads/a.png',
    );
    expect(element.querySelector('.flyer-art')).toBeNull();
  });

  it('hides the ENFOQUE caption and announces upcoming projects', () => {
    const element = render(
      { media: [], projects: [], services: [] },
      { ...DESIGN, tag: 'Enfoque' },
    );

    expect(element.querySelector('.sample-button.is-static')).not.toBeNull();
    expect(element.querySelector('.sample-caption')).toBeNull();
    expect(element.querySelector('.empty-service-note')?.textContent).toBe(
      'Próximamente, nuevos proyectos.',
    );
  });
});
