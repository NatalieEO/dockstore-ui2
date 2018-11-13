import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { CytoscapeOptions } from 'cytoscape';

import { WorkflowQuery } from '../../../shared/state/workflow.query';
import { WorkflowsService, WorkflowVersion } from '../../../shared/swagger';
import { DynamicPopover } from '../dynamicPopover.model';
import { DagQuery } from './dag.query';
import { DagStore } from './dag.store';
import * as cytoscape from 'cytoscape';
import ext from 'cytoscape-dagre';
import qtipExtension from 'cytoscape-qtip';

@Injectable()
export class DagService {
  readonly style = [
    {
      selector: 'node',
      style: {
        'content': 'data(name)',
        'font-size': '16px',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#7a88a9'
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'target-arrow-shape': 'triangle',
        'line-color': '#9dbaea',
        'target-arrow-color': '#9dbaea',
        'curve-style': 'bezier'
      }
    },

    {
      selector: 'node[id = "UniqueBeginKey"]',
      style: {
        'content': 'Start',
        'font-size': '16px',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#4caf50'
      }
    },

    {
      selector: 'node[id = "UniqueEndKey"]',
      style: {
        'content': 'End',
        'font-size': '16px',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#f44336'
      }
    },

    {
      selector: 'node[type = "workflow"]',
      style: {
        'content': 'data(name)',
        'font-size': '16px',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#4ab4a9'
      }
    },

    {
      selector: 'node[type = "tool"]',
      style: {
        'content': 'data(name)',
        'font-size': '16px',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#51aad8'
      }
    },

    {
      selector: 'node[type = "expressionTool"]',
      style: {
        'content': 'data(name)',
        'font-size': '16px',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#9966FF'
      }
    },

    {
      selector: 'edge.notselected',
      style: {
        'opacity': '0.4'
      }
    }
  ];

  constructor(private workflowsService: WorkflowsService, private dagStore: DagStore, private dagQuery: DagQuery,
    private renderer: Renderer2, private workflowQuery: WorkflowQuery) {
  }

  getTooltipText(name: string, tool: string, type: string, docker: string, run: string): string {
    const dynamicPopover = this.setDynamicPopover(name, tool, type, docker, run);
    return `
    <div>
    <div><b>Type: </b>${dynamicPopover.type}</div>
    ${this.getRunText(dynamicPopover.run)}
    ${this.getDockerText(dynamicPopover.link, dynamicPopover.docker)}
    </div>`;
  }

  setDynamicPopover(name: string, tool: string, type: string, docker: string, run: string): DynamicPopover {
    return {
      title: name ? name : 'n/a',
      link: tool,
      type: type ? type : 'n/a',
      docker: docker ? docker : 'n/a',
      run: run ? run : 'n/a'
    };
  }

  getRunText(run: string) {
    const isHttp = this.isHttp(run);
    if (isHttp) {
      return `<div><b>Run: </b> <a href='` + run + `'>` + run + `</a></div>`;
    } else {
      return `<div><b>Run: </b>` + run + `</div>`;
    }
  }

  getDockerText(link: string, docker: string) {
    const validLink = !this.isNA(docker);
    if (validLink) {
      return `<div><b>Docker: </b> <a href='` + link + `'>` + docker + `</a></div>`;
    } else {
      return `<div><b>Docker: </b>` + docker + `</div>`;
    }
  }

  isNA(docker: string) {
    return (docker === 'n/a');
  }

  isHttp(run: string) {
    if (run.match('^http') || run.match('^https')) {
      return true;
    } else {
      return false;
    }
  }

  setDagResults(results: any): void {
    this.dagStore.setState(state => {
      return {
        ...state,
        dagResults: results
      };
    });
  }

  download(cy: any, versionName: string, exportLink: ElementRef) {
    if (cy) {
      const pngDAG = cy.png({ full: true, scale: 2 });
      const name = this.workflowQuery.getActive().repository + '_' + versionName + '.png';
      this.renderer.setAttribute(exportLink.nativeElement, 'href', pngDAG);
      this.renderer.setAttribute(exportLink.nativeElement, 'download', name);
    }
  }

  getDAGResults(workflowVersion: WorkflowVersion, workflowId: number) {
    if (workflowVersion && workflowVersion.id) {
      this.getCurrentDAG(workflowId, workflowVersion.id).subscribe(result => {
        this.setDagResults(result);
      }, error => {
        this.setDagResults(null);
      });
    }
  }

  getCurrentDAG(workflowId, versionId) {
    if (workflowId && versionId) {
      return this.workflowsService.getWorkflowDag(workflowId, versionId);
    } else {
      return null;
    }
  }

  refreshDocument(cyto: any, element): any {
    const self = this;
    const dagResult = JSON.parse(JSON.stringify(this.dagQuery.getSnapshot().dagResults));
    if (dagResult) {
      const cytoscapeOptions: CytoscapeOptions = {
        container: element,
        boxSelectionEnabled: false,
        autounselectify: true,
        layout: {
          name: 'dagre'
        },
        style: this.style,
        elements: dagResult
      };
      cytoscape.use(ext);
      cytoscape.use(qtipExtension);
      cyto = cytoscape(cytoscapeOptions);


      cyto.on('mouseover', 'node[id!="UniqueBeginKey"][id!="UniqueEndKey"]', function () {
        const node = this;
        const name = this.data('name');
        const tool = this.data('tool');
        const type = this.data('type');
        const docker = this.data('docker');
        const run = this.data('run');
        const runText = self.getTooltipText(name, tool, type, docker, run);
        const tooltip = node.qtip({
          content: {
            text: runText,
            title: node.data('name')
          },
          show: {
            solo: true
          },
          style: {
            classes: 'qtip-bootstrap',
          }
        });
        const api = tooltip.qtip('api');
        api.toggle(true);
      });

      cyto.on('mouseout mousedown', 'node[id!="UniqueBeginKey"][id!="UniqueEndKey"]', function () {
        const node = this;
        const api = node.qtip('api');
        api.destroy();
      });

      cyto.on('mouseout', 'node', function () {
        const node = this;
        cyto.elements().removeClass('notselected');
        node.connectedEdges().animate({
          style: {
            'line-color': '#9dbaea',
            'target-arrow-color': '#9dbaea',
            'width': 3
          }
        }, {
            duration: 150
          });
      });

      cyto.on('mouseover', 'node', function () {
        const node = this;
        cyto.elements().difference(node.connectedEdges()).not(node).addClass('notselected');

        node.outgoers('edge').animate({
          style: {
            'line-color': '#e57373',
            'target-arrow-color': '#e57373',
            'width': 5
          }
        }, {
            duration: 150
          });
        node.incomers('edge').animate({
          style: {
            'line-color': '#81c784',
            'target-arrow-color': '#81c784',
            'width': 5
          }
        }, {
            duration: 150
          });
      });

      cyto.on('tap', 'node[id!="UniqueBeginKey"][id!="UniqueEndKey"]', function () {
        try { // your browser may block popups
          if (this.data('tool') !== 'https://hub.docker.com/_/' && this.data('tool') !== '' && this.data('tool') !== undefined) {
            window.open(this.data('tool'));
          }
        } catch (e) { // fall back on url change
          if (this.data('tool') !== 'https://hub.docker.com/_/' && this.data('tool') !== '' && this.data('tool') !== undefined) {
            window.location.href = this.data('tool');
          }
        }
      });
    }
    return cyto;
  }
}
