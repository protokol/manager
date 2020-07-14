import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NodeClientService } from '@core/services/node-client.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  NodeConfiguration,
  NodeCryptoConfiguration,
} from '@arkecosystem/client/dist/resourcesTypes/node';
import { JsonEditorOptions } from 'ang-jsoneditor';

@Component({
  selector: 'app-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeDetailsComponent implements OnInit, OnDestroy {
  readonly configurationEditorOptions: JsonEditorOptions;
  readonly cryptoEditorOptions: JsonEditorOptions;

  nodeConfiguration$: Observable<(NodeConfiguration & any) | null> = of(null);
  nodeCryptoConfiguration$: Observable<NodeCryptoConfiguration | null> = of(
    null
  );
  nodeUrl$ = new BehaviorSubject('');

  descriptionColumns = { xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private nodeClientService: NodeClientService
  ) {
    this.cryptoEditorOptions = new JsonEditorOptions();
    this.cryptoEditorOptions.mode = 'view';
    this.cryptoEditorOptions.expandAll = true;

    this.configurationEditorOptions = new JsonEditorOptions();
    this.configurationEditorOptions.mode = 'view';
    this.configurationEditorOptions.expandAll = true;
  }

  ngOnInit(): void {
    const nodeUrl: string = this.route.snapshot.paramMap.get('url');
    if (nodeUrl) {
      this.nodeUrl$.next(nodeUrl);

      this.nodeConfiguration$ = this.nodeClientService.getNodeConfiguration(
        nodeUrl
      );

      this.nodeCryptoConfiguration$ = this.nodeClientService.getNodeCryptoConfiguration(
        nodeUrl
      );
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {}
}
