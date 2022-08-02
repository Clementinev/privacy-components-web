import { html, LitElement, TemplateResult } from 'lit';
import { property } from 'lit/decorators';
import { choose } from 'lit/directives/choose.js';
import { Demand } from '../models/demand.js';
import { DemandState } from '../utils/states.js';

export abstract class ActionForm extends LitElement {
  @property({ type: Number, attribute: 'demand-state' })
  demandState: DemandState = DemandState.EDIT;

  @property({ attribute: false }) demands = new Map<string, Demand>();

  @property({ attribute: false }) demandBuilderId: string = '';

  setDemand(demandId: string, demand: Demand) {
    this.dispatchEvent(
      new CustomEvent('demand-set', {
        bubbles: true,
        composed: true,
        detail: {
          demandId,
          demand,
        },
      })
    );
  }

  setDemandMultiple(demands: Map<string, Demand>) {
    this.dispatchEvent(
      new CustomEvent('demand-set-multiple', {
        bubbles: true,
        composed: true,
        detail: {
          demands,
        },
      })
    );
  }

  deleteDemand(demandId: string) {
    this.dispatchEvent(
      new CustomEvent('demand-delete', {
        bubbles: true,
        composed: true,
        detail: {
          demandId,
        },
      })
    );
  }

  /**
   * Get the edit template for this action
   * @returns HTML template
   */
  abstract getEditTemplate(): TemplateResult;

  /**
   * Get the review template for this action
   * @returns HTML template
   */
  abstract getReviewTemplate(): TemplateResult;

  render(): TemplateResult<1 | 2> {
    return html`
      ${choose(this.demandState, [
        [DemandState.EDIT, () => this.getEditTemplate()],
        [DemandState.REVIEW, () => this.getReviewTemplate()],
      ])}
    `;
  }
}
