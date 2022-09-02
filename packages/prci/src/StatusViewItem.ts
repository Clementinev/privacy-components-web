import { msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import { LegalBase } from './models/legal-base.js';
import {
  ACTION,
  DEMAND_STATUS,
  PROCESSING_CATEGORY,
  PURPOSE,
} from './models/priv-terms.js';
import { PrivacyResponseItem } from './models/privacy-response.js';
import { Provenance } from './models/provenance.js';
import { RetentionPolicy } from './models/retention-policy.js';
import { buttonStyles, containerStyles } from './styles.js';
import { ACTION_DESCRIPTIONS, ACTION_TITLES } from './utils/dictionary.js';

/**
 * Status for a single demand in a Privacy Request
 */
@customElement('status-view-item')
export class StatusViewItem extends LitElement {
  @property({ attribute: false }) demand: PrivacyResponseItem = {
    demand_id: '',
    date: '',
    requested_action: ACTION.ACCESS,
    status: DEMAND_STATUS.GRANTED,
    includes: [],
    system: '',
  };

  @property({ attribute: false }) demands: PrivacyResponseItem[] = [];

  @state() _open: boolean = false;

  static styles = [
    containerStyles,
    buttonStyles,
    css`
      .demand-status-ctr {
        display: flex;
        flex-direction: column;
        border-radius: 15px;
        border: 2px solid #e6e6e6;
        box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.5);
      }

      .demand-status-ctr span {
        padding: 10px 0px;
      }

      .dmd-action-ctr {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        align-items: center;
        justify-items: center;
        column-gap: 20px;
        padding: 20px 20px;
        background: white;
      }

      .granted-dmd {
        background-color: #51d214;
        border-color: #51d214;
      }

      .denied-dmd {
        background-color: #f90707;
        border-color: #f90707;
      }

      .partially-granted-dmd {
        background-color: #ff7a00;
        border-color: #ff7a00;
      }

      .granted-dmd span {
        color: white;
      }

      .denied-dmd span {
        color: white;
      }

      .partially-granted-dmd span {
        color: white;
      }

      .under-review-dmd {
        background-color: #e6e6e6;
        border-color: #e6e6e6;
      }

      .cancelled-dmd {
        background-color: #ffc1bd;
        border-color: #ffc1bd;
      }

      .action-title {
        justify-self: center;
      }

      .status-btn {
        background: none;
        padding: 10px 20px;
        justify-self: center;
        align-self: flex-end;
        float: right;
      }

      .access-btn {
        border: 2px solid #18a0fb;
      }

      .cancel-btn {
        border: 2px solid #f90707;
      }

      .round-bottom {
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
      }

      .dmd-details-ctr {
        display: grid;
        background-color: white;
        /* height: 100px; */
        padding: 10px 20px 30px 20px;
      }

      p {
        margin: 0;
        padding: 0;
      }
    `,
  ];

  accessResponseTemplate(demand: PrivacyResponseItem) {
    return html`
      ${choose(demand.status, [
        [
          DEMAND_STATUS.GRANTED,
          () => {
            if (demand.data) {
              return html`
                <div>
                  ${msg(
                    // NOTE: For now, we assume demand.data is a JSON file
                    html`Click <a href="${demand.data}.json">here</a> to
                      download your data.`
                  )}
                </div>
              `;
            }
            return html`${msg(
              'Obtaining data, please wait and refresh the page later.'
            )}`;
          },
        ],
        [
          DEMAND_STATUS.DENIED,
          () =>
            html`Your ${demand.requested_action.toLocaleLowerCase()} demand has
            been denied.`,
        ],
        [
          DEMAND_STATUS.CANCELED,
          () =>
            html`Your ${demand.requested_action.toLocaleLowerCase()} demand has
            been cancelled`,
        ],
        [
          DEMAND_STATUS['PARTIALLY-GRANTED'],
          () =>
            html`Your ${demand.requested_action.toLocaleLowerCase()} demand has
            been partially granted.`,
        ],
        [
          DEMAND_STATUS['UNDER-REVIEW'],
          () =>
            html`Your ${demand.requested_action.toLocaleLowerCase()} demand is
            under review.`,
        ],
      ])}
    `;
  }

  deleteResponseTemplate(demand: PrivacyResponseItem) {
    return html`
      ${choose(demand.status, [
        [
          DEMAND_STATUS.GRANTED,
          () =>
            html`Your ${demand.requested_action.toLocaleLowerCase()} demand has
            been granted.`,
        ],
        [
          DEMAND_STATUS.DENIED,
          () =>
            html`Your ${demand.requested_action.toLocaleLowerCase()} demand has
            been denied.`,
        ],
        [
          DEMAND_STATUS.CANCELED,
          () =>
            html`Your ${demand.requested_action.toLocaleLowerCase()} demand has
            been cancelled`,
        ],
        [
          DEMAND_STATUS['PARTIALLY-GRANTED'],
          () =>
            html`Your ${demand.requested_action.toLocaleLowerCase()} demand has
            been partially granted.`,
        ],
        [
          DEMAND_STATUS['UNDER-REVIEW'],
          () =>
            html`Your ${demand.requested_action.toLocaleLowerCase()} demand is
            under review.`,
        ],
      ])}
    `;
  }

  transparencyResponseTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${demand.answer}
    `;
  }

  transparencyDcTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${map(demand.answer as Array<string>, dc => html` ${dc}<br /> `)}
    `;
  }

  transparencyDpoTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${demand.answer}
    `;
  }

  transparencyKnownTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${demand.answer}
    `;
  }

  transparencyLbTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${map(
        demand.answer as Array<LegalBase>,
        lb => html`
          Type: ${lb.lb_type}<br />
          Name: ${lb.name}<br />
          Description: ${lb.description}<br /><br />
        `
      )}
    `;
  }

  transparencyOrgTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${demand.answer}
    `;
  }

  transparencyPolicyTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${demand.answer}
    `;
  }

  transparencyPcTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${map(
        demand.answer as Array<PROCESSING_CATEGORY>,
        pc => html` ${pc}<br /> `
      )}
    `;
  }

  transparencyProvTemplate(demand: PrivacyResponseItem) {
    const answer = demand.answer as {
      'AFFILIATION.selector_1': Provenance[];
      'AFFILIATION.MEMBERSHIP.selector_2': Provenance[];
      'FINANCIAL.BANK-ACCOUNT.selector_3': Provenance[];
    };
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${map(
        answer['AFFILIATION.selector_1'],
        prov => html`
          Provenance: ${prov.provenance}<br />
          System: ${prov.system}<br /><br />
        `
      )}
      ${map(
        answer['AFFILIATION.MEMBERSHIP.selector_2'],
        prov => html`
          Provenance: ${prov.provenance}<br />
          System: ${prov.system}<br /><br />
        `
      )}
      ${map(
        answer['FINANCIAL.BANK-ACCOUNT.selector_3'],
        prov => html`
          Provenance: ${prov.provenance}<br />
          System: ${prov.system}<br /><br />
        `
      )}
    `;
  }

  transparencyPurposeTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${map(
        demand.answer as Array<PURPOSE>,
        purpose => html` ${purpose}<br /> `
      )}
    `;
  }

  transparencyRetTemplate(demand: PrivacyResponseItem) {
    const answer = demand.answer as {
      'AFFILIATION.selector_1': RetentionPolicy[];
      'AFFILIATION.MEMBERSHIP.selector_2': RetentionPolicy[];
      'FINANCIAL.BANK-ACCOUNT.selector_3': RetentionPolicy[];
      AFFILIATION: RetentionPolicy[];
    };
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${map(
        answer['AFFILIATION.selector_1'],
        rp => html`
          Policy type: ${rp.policy_type}<br />
          Duration: ${rp.duration}<br />
          After: ${rp.after}<br /><br />
        `
      )}
      ${map(
        answer['AFFILIATION.MEMBERSHIP.selector_2'],
        rp => html`
          Policy type: ${rp.policy_type}<br />
          Duration: ${rp.duration}<br />
          After: ${rp.after}<br /><br />
        `
      )}
      ${map(
        answer['FINANCIAL.BANK-ACCOUNT.selector_3'],
        rp => html`
          Policy type: ${rp.policy_type}<br />
          Duration: ${rp.duration}<br />
          After: ${rp.after}<br /><br />
        `
      )}
      ${map(
        answer.AFFILIATION,
        rp => html`
          Policy type: ${rp.policy_type}<br />
          Duration: ${rp.duration}<br />
          After: ${rp.after}<br /><br />
        `
      )}
    `;
  }

  transparencyWhereTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${map(demand.answer as Array<string>, where => html` ${where}<br /> `)}
    `;
  }

  transparencyWhoTemplate(demand: PrivacyResponseItem) {
    return html`
      <b>${ACTION_DESCRIPTIONS[demand.requested_action]()}</b><br />
      ${map(demand.answer as Array<string>, who => html` ${who}<br /> `)}
    `;
  }

  render() {
    return html`
      <div
        class="demand-status-ctr ${this.demand.status.toLocaleLowerCase()}-dmd medium-border"
      >
        <span class="status-type-ctr">${this.demand.status}</span>
        <div class="dmd-action-ctr ${this._open ? '' : 'round-bottom'}">
          <p class="action-title">
            <b
              >${ACTION_TITLES[this.demand.requested_action]()}
              ${msg('Demand')}</b
            >
          </p>
          ${when(
            [
              DEMAND_STATUS.GRANTED,
              DEMAND_STATUS['PARTIALLY-GRANTED'],
              DEMAND_STATUS.DENIED,
            ].includes(this.demand.status),
            () => html`
              <button
                class="status-btn access-btn curve-btn animated-btn"
                @click=${() => {
                  this._open = !this._open;
                }}
              >
                ${msg('ACCESS DETAILS')}
              </button>
            `
          )}
          ${when(
            this.demand.status === DEMAND_STATUS['UNDER-REVIEW'],
            () => html`
              <button
                class="status-btn cancel-btn curve-btn animated-btn"
                @click=${() => {
                  this._open = !this._open;
                }}
              >
                ${msg('CANCEL DEMAND')}
              </button>
            `
          )}
        </div>
        ${when(
          this._open,
          () => html`
            <div
              id="${this.demand.demand_id}-details-ctr"
              class="dmd-details-ctr round-bottom"
            >
              ${choose(
                this.demand.requested_action,
                [
                  [
                    ACTION.ACCESS,
                    () => this.accessResponseTemplate(this.demand),
                  ],
                  [
                    ACTION.DELETE,
                    () => this.deleteResponseTemplate(this.demand),
                  ],
                  [
                    ACTION.TRANSPARENCY,
                    () => this.transparencyResponseTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.DATA.CATEGORIES'],
                    () => this.transparencyDcTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.DPO'],
                    () => this.transparencyDpoTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.KNOWN'],
                    () => this.transparencyKnownTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.LEGAL.BASES'],
                    () => this.transparencyLbTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.ORGANIZATION'],
                    () => this.transparencyOrgTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.POLICY'],
                    () => this.transparencyPolicyTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.PROCESSING.CATEGORIES'],
                    () => this.transparencyPcTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.PROVENANCE'],
                    () => this.transparencyProvTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.PURPOSE'],
                    () => this.transparencyPurposeTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.RETENTION'],
                    () => this.transparencyRetTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.WHERE'],
                    () => this.transparencyWhereTemplate(this.demand),
                  ],
                  [
                    ACTION['TRANSPARENCY.WHO'],
                    () => this.transparencyWhoTemplate(this.demand),
                  ],
                ],
                () => this.transparencyResponseTemplate(this.demand)
              )}
            </div>
          `
        )}
      </div>
    `;
  }
}
