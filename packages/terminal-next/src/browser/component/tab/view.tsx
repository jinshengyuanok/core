import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useInjectable } from '@ali/ide-core-browser';
import TabItem, { ItemType } from './item';
import { TabManager } from './manager';
import { TerminalContextMenuService } from '../../terminal.menu';
import { ITerminalController } from '../../../common';

import * as styles from './index.module.less';

export default observer(() => {
  const manager = useInjectable<TabManager>(TabManager);
  const controller = useInjectable<ITerminalController>(ITerminalController);
  const menuService = useInjectable<TerminalContextMenuService>(TerminalContextMenuService);

  return (
    <div className={ styles.view_container }>
      {
        manager.items.map((_, index) => {
          const group = controller.groups[index];
          return (
            <TabItem
              name={ (group && group.snapshot) || 'init...' }
              key={ `tab-item-${index}` }
              selected={ manager.state.current === index }
              onClick={ () => manager.select(index) }
              onClose={ () => manager.remove(index) }
              onContextMenu={ (event) => menuService.onTabContextMenu(event) }
            ></TabItem>
          );
        })
      }
      <TabItem
        type={ ItemType.add }
        onClick={ () => manager.create() }
      ></TabItem>
    </div>
  );
});