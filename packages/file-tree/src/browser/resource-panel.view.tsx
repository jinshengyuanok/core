import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { ViewState, ThemeProvider, useInjectable } from '@ali/ide-core-browser';
import { Icon, Input } from '@ali/ide-components';
import { localize } from '@ali/ide-core-common';

import { FileTree } from './file-tree.view';
import { ExplorerResourceService } from './explorer-resource.service';
import { EmptyView } from './empty.view';

import * as styles from './resource-panel.module.less';

const filterAreaHeight = 30;

export const ExplorerResourcePanel = observer(({
  viewState,
}: React.PropsWithChildren<{viewState: ViewState}>) => {
  const {
    getFiles,
    onSelect,
    onTwistieClick,
    onDragStart,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onChange,
    onDrop,
    onBlur,
    onFocus,
    draggable,
    editable,
    multiSelectable,
    onContextMenu,
    position,
    overrideFileDecorationService,
    themeService,
    decorationChangeEvent,
    themeChangeEvent,
    validateFileName,
    root,
    baseIndent,
    indent,
    filterMode,
    filter,
    treeFilter,
    pathFilter,
    onFilterChange,
    onClearClicked,
  }: ExplorerResourceService = useInjectable(ExplorerResourceService) as ExplorerResourceService;
  const files = getFiles();
  const leftPadding = React.useMemo(() => {
    return indent;
  }, [indent]);

  const defaultLeftPadding = React.useMemo(() => {
    return baseIndent;
  }, [baseIndent]);
  if (root.path.toString() !== '/') {
    return (
      <>
        {
          filterMode
            && <div className={styles.filterWrapper} style={{ height: filterAreaHeight }}>
              <Input
                hasClear
                autoFocus
                size='small'
                className={styles.filterInput}
                value={filter}
                onValueChange={onFilterChange}
                afterClear={onClearClicked}
                placeholder={localize('tree.filter.placeholder')}
                addonBefore={<Icon className={styles.filterIcon} icon='retrieval' />} />
            </div>
        }
        <FileTree
          style={{ top: filterMode ? filterAreaHeight : 0 }}
          width={ viewState.width }
          height={ viewState.height - (filterMode ? filterAreaHeight : 0) }
          filter={ pathFilter ? '' : treeFilter}
          files={ files }
          onSelect={ onSelect }
          onTwistieClick={ onTwistieClick }
          onDragStart={ onDragStart }
          onDragOver={ onDragOver }
          onDragEnter={ onDragEnter }
          onDragLeave={ onDragLeave }
          onChange = { onChange }
          onDrop={ onDrop }
          onBlur={ onBlur }
          onFocus={ onFocus }
          draggable={ draggable }
          editable={ editable }
          multiSelectable={ multiSelectable }
          onContextMenu={ onContextMenu }
          position = { position }
          fileDecorationProvider = { overrideFileDecorationService }
          themeProvider = { themeService as ThemeProvider }
          notifyFileDecorationsChange = { decorationChangeEvent }
          notifyThemeChange = { themeChangeEvent }
          validate={ validateFileName }
          leftPadding={ leftPadding }
          defaultLeftPadding={ defaultLeftPadding }
        />
      </>
    );
  } else {
    return <EmptyView />;
  }
});
