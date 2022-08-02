import { msg } from '@lit/localize';
import { html, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';
import { Demand } from '../models/demand.js';
import { ACTION } from '../models/priv-terms.js';
import { enabledActions } from '../utils/conf.js';
import { ACTION_DESCRIPTIONS } from '../utils/dictionary.js';
import { ActionForm } from './ActionForm.js';

export class TransparencyForm extends ActionForm {
  @property({ type: Array, attribute: false })
  transparencyActions: ACTION[] = [];

  private _extraMessage = undefined;

  constructor() {
    super();

    this.addEventListener('dropdown-element-add', e => {
      const details = (e as CustomEvent).detail;
      const demandId = uuidv4();
      const demand: Demand = {
        action: details.id,
        message: this._extraMessage,
      };
      this.setDemand(demandId, demand);
    });

    this.addEventListener('dropdown-element-delete', e => {
      const details = (e as CustomEvent).detail;
      // Delete demands for the unchecked action
      Array.from(this.demands)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, d]) => d.action === details.id)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .forEach(([demandId, _]) => {
          this.demands.delete(demandId);
          // Fire event to delete a single demand
          this.deleteDemand(demandId);
        });
    });
  }

  getEditTemplate(): TemplateResult<1 | 2> {
    const selectedActions = Object.values(this.demands).map(d => d.action);
    return html`
      <p id="edit-heading-1">
        <b>${msg('Details of my TRANSPARENCY Demand')}</b>
      </p>
      <demand-builder-dropdown-element
        .choices=${this.transparencyActions.map(a => ({
          id: a,
          description: ACTION_DESCRIPTIONS[a](),
          checked: selectedActions.includes(a),
          disabled: !enabledActions.get(a) ?? true,
        }))}
      ></demand-builder-dropdown-element>
      <demand-builder-text-element></demand-builder-text-element>
    `;
  }

  getReviewTemplate(): TemplateResult<1 | 2> {
    return html`
      <div id="dmd-ctr">
        <p id="review-hd-1"><b>${msg('TRANSPARENCY demand')}</b></p>
        <p>${msg('I want to know:')}</p>
        <ul id="transparency-demand-review-list">
          ${Array.from(this.demands.values()).map(
            (a: Demand) =>
              html` <li><b>${ACTION_DESCRIPTIONS[a.action]()}</b></li> `
          )}
        </ul>
        ${this._extraMessage
          ? html`
              <p>${msg('Plus additional info:')}</p>
              <p id="extra-msg-txt"><i>${this._extraMessage}</i></p>
            `
          : null}
      </div>
    `;
  }
}
