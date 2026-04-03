import { useEffect, useMemo, useState } from 'react'
import { useTodoCtx } from './todo-context'
import {
  findNode,
  getAllStarred,
  getProgress,
  toggleTree,
  upd,
} from './tree-utils'
import type { TreeNode } from './types'
import { FocusPomodoro } from './FocusPomodoro'

export function HarvestView() {
  const { tree, setTree } = useTodoCtx()
  const items = getAllStarred(tree)
  const [focusRootId, setFocusRootId] = useState<string | null>(null)
  const focusRoot = useMemo(
    () => (focusRootId ? findNode(tree, focusRootId) : null),
    [tree, focusRootId],
  )

  useEffect(() => {
    if (!focusRootId) {
      return
    }

    if (!focusRoot) {
      setFocusRootId(null)
    }
  }, [focusRoot, focusRootId])

  useEffect(() => {
    if (!focusRoot) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFocusRootId(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [focusRoot])

  const renderFocusNode = (node: TreeNode, depth = 0) => {
    const isFolder = node.kind === 'folder'
    const { done, total } = getProgress(node)
    const allDone = !isFolder && total > 0 && done === total
    const someDone = !isFolder && !allDone && done > 0

    return (
      <div key={node.id} className="focus-node-wrap">
        <div className="focus-node" style={{ paddingLeft: `${depth * 18}px` }}>
          <button
            className={`check${isFolder ? ' folder' : ''}${allDone ? ' done' : someDone ? ' part' : ''}`}
            onClick={() =>
              !isFolder && setTree((prev) => toggleTree(prev, node.id))
            }
            disabled={isFolder}
            title={isFolder ? 'Category (not completable)' : undefined}
          >
            {isFolder ? '∞' : allDone ? '✓' : someDone ? '-' : ''}
          </button>
          <div className="focus-node-text-wrap">
            <div
              className={`focus-node-text${isFolder ? ' folder' : ''}${allDone ? ' done' : ''}`}
            >
              {node.text || 'Untitled task'}
            </div>
            {node.children.length > 0 && (
              <div className="focus-node-meta">
                {done}/{total} complete
              </div>
            )}
          </div>
        </div>
        {node.children.length > 0 && (
          <div>
            {node.children.map((child) => renderFocusNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="empty">
        <div style={{ fontSize: 44, opacity: 0.15 }}>★</div>
        <div>No pinned tasks yet</div>
        <div style={{ fontSize: 12, color: '#928c86' }}>
          Star tasks in the Tree view to harvest them here
        </div>
      </div>
    )
  }

  return (
    <div className="harvest">
      <div className="harvest-hint">
        Starred tasks harvested from across your tree
      </div>
      {items.map((item) => {
        const isFolder = item.kind === 'folder'
        const { done, total } = getProgress(item)
        const allDone = !isFolder && total > 0 && done === total

        return (
          <div
            key={item.id}
            className="h-item can-focus"
            onClick={() => setFocusRootId(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                (event.key === 'Enter' || event.key === ' ') &&
                !event.defaultPrevented
              ) {
                event.preventDefault()
                setFocusRootId(item.id)
              }
            }}
            title="Open focused subtree"
          >
            <button
              className={`check${isFolder ? ' folder' : ''}${allDone ? ' done' : ''}`}
              style={{ flexShrink: 0 }}
              onClick={(event) => {
                event.stopPropagation()
                if (!isFolder) {
                  setTree((prev) => toggleTree(prev, item.id))
                }
              }}
              disabled={isFolder}
              title={isFolder ? 'Category (not completable)' : undefined}
            >
              {isFolder ? '∞' : allDone && '✓'}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 14,
                  color: isFolder ? '#d9cbab' : allDone ? '#928c86' : '#e6dfd6',
                  textDecoration:
                    !isFolder && allDone ? 'line-through' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.text}
              </div>
              {item._path.length > 0 && (
                <div className="h-path">{item._path.join(' > ')}</div>
              )}
            </div>
            <button
              className="act starred"
              title="Unpin"
              onClick={(event) => {
                event.stopPropagation()
                setTree((prev) =>
                  upd(prev, item.id, (target) => {
                    target.starred = false
                  }),
                )
              }}
            >
              ★
            </button>
          </div>
        )
      })}

      {focusRoot && (
        <div
          className="focus-modal-backdrop"
          onClick={() => setFocusRootId(null)}
        >
          <section
            className="focus-modal island-shell"
            role="dialog"
            aria-modal="true"
            aria-label="Focused subtree"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="focus-modal-head">
              <div>
                <div className="suggestions-kicker">Focus</div>
                <h2 className="focus-modal-title">
                  {focusRoot.text || 'Untitled task'}
                </h2>
              </div>
              <button
                className="focus-close-btn"
                onClick={() => setFocusRootId(null)}
                aria-label="Close focus modal"
                title="Close"
              >
                ×
              </button>
            </div>
            <FocusPomodoro />
            <div className="focus-modal-body">{renderFocusNode(focusRoot)}</div>
          </section>
        </div>
      )}
    </div>
  )
}
