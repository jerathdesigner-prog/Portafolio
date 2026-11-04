import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import {
  GENERIC_COVER_ART,
  LEGACY_ART,
} from '../../constants/legacy-art.constants';
import {
  DEFAULT_SERVICE_CAPTION,
  HIDDEN_SERVICE_CAPTION,
} from '../../constants/portfolio.constants';
import type {
  PortfolioMedia,
  PortfolioServiceItem,
  PublicPortfolio,
} from '../../interfaces/portfolio.interface';

/** `<span class="artwork x">inner</span>` split so Angular renders the span. */
function splitArtwork(html: string): { className: string; inner: string } {
  const match = /^<span[^>]*class="([^"]*)"[^>]*>([\s\S]*)<\/span>$/.exec(html);
  return match
    ? { className: match[1], inner: match[2] }
    : { className: 'artwork', inner: html };
}

/**
 * One service of the horizontal "works" track. Attribute selector so the
 * `<article class="service-panel">` stays a direct child of the track, with
 * the exact markup the legacy motion script and styles expect.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  selector: 'article[appServicePanel]',
  standalone: true,
  templateUrl: './service-panel.component.html',
})
export class ServicePanelComponent {
  readonly content = input.required<PublicPortfolio>();
  readonly number = input.required<number>();
  readonly service = input.required<PortfolioServiceItem>();

  protected readonly label = computed(() =>
    String(this.number()).padStart(2, '0'),
  );
  protected readonly projects = computed(() =>
    this.content().projects.filter((p) => p.serviceId === this.service().id),
  );
  protected readonly cover = computed<PortfolioMedia | undefined>(() => {
    const id = this.service().coverMediaId;
    return id ? this.content().media.find((m) => m.id === id) : undefined;
  });
  protected readonly artwork = computed(() =>
    splitArtwork(LEGACY_ART[this.service().slug ?? ''] ?? GENERIC_COVER_ART),
  );
  protected readonly caption = computed(() => {
    const caption = (this.service().tag ?? DEFAULT_SERVICE_CAPTION).trim();
    return caption.toUpperCase() === HIDDEN_SERVICE_CAPTION ? '' : caption;
  });
}
