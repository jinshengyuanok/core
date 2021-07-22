import * as React from 'react';
import * as clx from 'classnames';
import { useInjectable } from '@ali/ide-core-browser/lib/react-hooks';
import { observer } from 'mobx-react-lite';
import { RecycleTree, IRecycleTreeHandle, TreeNodeType, TreeModel } from '@ali/ide-components';
import { isOSX } from '@ali/ide-core-common';

import { SCMResourceFolder, SCMResourceFile, SCMResourceGroup, SCMResourceNotRoot } from './scm-tree-node';
import { SCMTreeModelService } from './scm-tree-model.service';
import { ISCMTreeNodeProps, SCMTreeNode, SCM_TREE_NODE_HEIGHT } from './scm-tree-node.view';

import { ViewModelContext } from '../../scm-model';

import * as styles from './index.module.less';

export const TREE_FIELD_NAME = 'SCM_TREE_TREE_FIELD';

export const SCMResourceTree: React.FC<{
  width: number;
  height: number;
}> = observer(({
  width,
  height,
}) => {
  const [isReady, setIsReady] = React.useState<boolean>(false);
  const [model, setModel] = React.useState<TreeModel>();

  const wrapperRef: React.RefObject<HTMLDivElement> = React.createRef();

  const scmTreeModelService = useInjectable<SCMTreeModelService>(SCMTreeModelService);
  const { iconThemeDesc, decorationService, labelService, commandService } = scmTreeModelService;

  const viewModel = useInjectable<ViewModelContext>(ViewModelContext);

  // effects
  React.useEffect(() => {
    // ensure ready
    (async () => {
      await scmTreeModelService.whenReady;
      if (!!scmTreeModelService.treeModel) {
        // 确保数据初始化完毕，减少初始化数据过程中多次刷新视图
        // 这里需要重新取一下treeModel的值确保为最新的TreeModel
        await scmTreeModelService.treeModel.root.ensureLoaded();
      }
      setIsReady(true);
    })();

    return () => {
      scmTreeModelService.removeFileDecoration();
    };
  }, []);

  React.useEffect(() => {
    if (isReady) {
      setModel(scmTreeModelService.treeModel);
      scmTreeModelService.onDidTreeModelChange(async (model) => {
        await scmTreeModelService.whenReady;
        if (!!model) {
          // 确保数据初始化完毕，减少初始化数据过程中多次刷新视图
          await scmTreeModelService.treeModel.root.ensureLoaded();
        }
        setModel(model);
      });
    }
  }, [isReady]);

  React.useEffect(() => {
    const handleBlur = () => {
      scmTreeModelService.handleTreeBlur();
    };
    wrapperRef.current?.addEventListener('blur', handleBlur, true);
    return () => {
      wrapperRef.current?.removeEventListener('blur', handleBlur, true);
      scmTreeModelService.handleTreeBlur();
    };
  }, [wrapperRef.current]);

  // event handlers
  const handleTreeReady = React.useCallback((handle: IRecycleTreeHandle) => {
    scmTreeModelService.handleTreeHandler({
      ...handle,
      getModel: () => scmTreeModelService.treeModel,
      hasDirectFocus: () => wrapperRef.current === document.activeElement,
    });
  }, []);

  const hasShiftMask = React.useCallback((event: React.MouseEvent): boolean => {
    // Ctrl/Cmd 权重更高
    if (hasCtrlCmdMask(event)) {
      return false;
    }
    return event.shiftKey;
  }, []);

  const hasCtrlCmdMask = React.useCallback((event: React.MouseEvent): boolean => {
    const { metaKey, ctrlKey } = event;
    return (isOSX && metaKey) || ctrlKey;
  }, []);

  const handleItemClick = React.useCallback((event: React.MouseEvent, item: SCMResourceFile | SCMResourceGroup, type: TreeNodeType) => {
    // 阻止点击事件冒泡
    event.stopPropagation();

    if (!item) {
      return;
    }

    const shiftMask = hasShiftMask(event);
    const ctrlCmdMask = hasCtrlCmdMask(event);
    // 多选
    if (shiftMask) {
      scmTreeModelService.handleItemRangeClick(item, type);
    } else if (ctrlCmdMask) {
      scmTreeModelService.handleItemToggleClick(item, type);
    } else {
      scmTreeModelService.handleItemClick(item, type);
    }
  }, []);

  const handleTwistierClick = React.useCallback((ev: React.MouseEvent, item: SCMResourceFolder) => {
    // 阻止点击事件冒泡
    ev.stopPropagation();

    scmTreeModelService.toggleDirectory(item);
  }, []);

  const handleItemDoubleClick = React.useCallback((event: React.MouseEvent, item: SCMResourceNotRoot, type: TreeNodeType) => {
    // 阻止点击事件冒泡
    event.stopPropagation();

    if (!item) {
      return;
    }
    scmTreeModelService.handleItemDoubleClick(item, type);
  }, []);

  const handleContextMenu = React.useCallback((event: React.MouseEvent, item: SCMResourceNotRoot, type: TreeNodeType) => {
    event.preventDefault();
    scmTreeModelService.handleContextMenu(event, item, type);
  }, []);

  const renderSCMTreeNode = React.useCallback((props: ISCMTreeNodeProps) => (
    <SCMTreeNode
      item={props.item}
      itemType={props.itemType}
      decorationService={decorationService}
      labelService={labelService}
      commandService={commandService}
      decorations={scmTreeModelService.decorations.getDecorations(props.item)}
      onClick={handleItemClick}
      onDoubleClick={handleItemDoubleClick}
      onTwistierClick={handleTwistierClick}
      onContextMenu={handleContextMenu}
      defaultLeftPadding={8}
      leftPadding={8}
      iconTheme={iconThemeDesc}
    />
  ), [model]);

  return <div
    className={clx(styles.scm_tree_container, { 'scm-show-actions': viewModel.alwaysShowActions })}
    tabIndex={-1}
    ref={wrapperRef}
    data-name={TREE_FIELD_NAME}
  >
    {
      isReady
        ? (
          !!model && <RecycleTree
            height={height}
            width={width}
            itemHeight={SCM_TREE_NODE_HEIGHT}
            onReady={handleTreeReady}
            model={model}
            getItemKey={(node: ISCMTreeNodeProps) => node.item.raw.id}
            overScanCount={100}
          >
            {renderSCMTreeNode}
          </RecycleTree>
        )
        : <span className={styles.scm_tree_empty_text}></span>
    }
  </div>;
});

SCMResourceTree.displayName = 'SCMResourceTree';
