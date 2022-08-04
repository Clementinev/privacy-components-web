/* eslint-disable */
import { html, css, LitElement, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { localized, msg, str } from '@lit/localize';

import { ACTION } from './models/priv-terms.js';
import { enabledActions } from './utils/conf.js';
import { Demand } from './models/demand.js';
import { ACTION_TITLES, ACTION_DESCRIPTIONS } from './utils/dictionary.js';
import { DemandState } from './utils/states.js';
import './DemandBuilderActionMenu.js';
import './SlottedDropdown.js';
import './DemandBuilderTextElement.js';
import './demand-forms/TransparencyForm.js';
import './DemandBuilderSidebarItem.js';
import { when } from 'lit/directives/when.js';

/**
 * Handles creation and review of a single demand. Uses one of the ActionForm
 * components to display different options for each action type.
 */
@customElement('demand-builder')
@localized()
export class DemandBuilder extends LitElement {
  @property({ type: Array }) includedActions: ACTION[] = [];

  @property({ type: Number, attribute: 'demand-state' })
  demandState: DemandState = DemandState.SELECT_ACTION;

  @property({ attribute: false }) demands = new Map<string, Demand>();

  @state() _selectedAction = ACTION.TRANSPARENCY;

  @state() _sidebarSelectedIndex = 0;

  constructor() {
    super();

    // Demand update listeners - Do we even need these listeners or can the demands
    // just flow down from the top level?
    this.addEventListener('demand-set', e => {
      const { demandId, demand } = (e as CustomEvent).detail;
      this.demands.set(demandId, demand);
    });
    this.addEventListener('demand-delete', e => {
      const { id } = (e as CustomEvent).detail;
      this.demands.delete(id);
    });
    this.addEventListener('demand-set-multiple', e => {
      ((e as CustomEvent).detail.demands as Map<string, Demand>).forEach(
        (demand, id) => this.demands.set(id, demand)
      );
    });

    // UI element listeners
    this.addEventListener('demand-action-menu-click', () => {
      this._selectedAction = ACTION.TRANSPARENCY;
      this.demandState = DemandState.EDIT_OPEN;
    });
    this.addEventListener('sidebar-click', e => {
      this._sidebarSelectedIndex = this.includedActions.indexOf(
        (e as CustomEvent).detail.id
      );
    });
  }

  static styles = css`
    :host {
      display: grid;
      grid-row: 2/3;
      grid-column: 1/2;
      grid-template-columns: repeat(4, 1fr);
    }

    .demand-builder-back-btn {
      grid-column-start: 1/2;
    }

    #sidebar {
      display: grid;
      height: fit-content;
    }

    p {
      padding: 0px;
      margin: 0px;
    }
  `;

  /**
   * Get a HTML template for the demand builder sidebar, with each PRIV action
   * included in this DemandBuilder as an option.
   * @returns HTML template for sidebar display
   */
  getSidebarTemplate(): TemplateResult {
    return html`
      <div id="sidebar">
        <p id="sidebar-title">${msg('Type of demand:')}</p>
        ${this.includedActions.map(
          (a, i) => html`
            <demand-builder-sidebar-item
              id=${a}
              title=${ACTION_TITLES[a]()}
              description=${ACTION_DESCRIPTIONS[a]()}
              ?disabled=${!enabledActions.get(a)}
              ?checked=${i === this._sidebarSelectedIndex}
            ></demand-builder-sidebar-item>
          `
        )}
      </div>
    `;
  }

  getActionMenuTemplate(): TemplateResult {
    return html`<demand-builder-action-menu
      .includedActions=${this.includedActions}
    ></demand-builder-action-menu>`;
  }

  getAuthTemplate(): TemplateResult {
    return html`Authentication will happen here!`;
  }

  /**
   * Get an HTML template for the form corresponding to the selected action type.
   * @returns HTML template for action form
   */
  getSelectedFormTemplate(): TemplateResult {
    return html`
      ${choose(this._selectedAction, [
        [
          ACTION.TRANSPARENCY,
          () => html`<transparency-form
            demand-state=${this.demandState}
            .demandBuilderId=${this.id}
            .transparencyActions=${Object.values(ACTION).filter(a =>
              a.includes('TRANSPARENCY.')
            )}
            .demands=${this.demands}
          ></transparency-form>`,
        ],
      ])}
    `;
  }

  /**
   * Hook into update to fire an event letting the top level component know the user
   * has navigated past the action menu screen.
   * @param changedProperties Map of changed values to their previous value
   */
  update(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    super.update(changedProperties);

    if (
      changedProperties.has('demandState') &&
      changedProperties.get('demandState') === DemandState.SELECT_ACTION
    ) {
      this.dispatchEvent(
        new Event('menu-done', { bubbles: true, composed: true })
      );
    }
  }

  /**
   * Hook into firstUpdated to include an initial calculation of the sidebar index
   * @param _changedProperties
   */
  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.firstUpdated(_changedProperties);
    this._sidebarSelectedIndex = this.includedActions.indexOf(
      this._selectedAction
    );
  }

  render() {
    return html`
      ${choose(
        this.demandState,
        [
          [DemandState.SELECT_ACTION, () => this.getActionMenuTemplate()],
          [DemandState.AUTH, () => this.getAuthTemplate()],
        ],
        () => this.getSelectedFormTemplate()
      )}
    `;
  }
}
