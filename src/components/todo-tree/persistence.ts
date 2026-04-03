import type { Breadcrumb, PersistedState, TreeNode } from './types'
import { readParsedFromStorage, writeJsonToStorage } from '../../utils/storage'

const STORAGE_KEY = 'todo-tree-state'

function normalizeTree(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => {
    const kind = node.kind === 'folder' ? 'folder' : 'task'
    const children = Array.isArray(node.children)
      ? normalizeTree(node.children)
      : []

    return {
      ...node,
      kind,
      children,
      completed: kind === 'folder' ? false : Boolean(node.completed),
      collapsed: Boolean(node.collapsed),
      starred: Boolean(node.starred),
    }
  })
}

function normalizeSuggestionHides(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const result: Record<string, number> = {}
  for (const [key, rawUntil] of Object.entries(
    value as Record<string, unknown>,
  )) {
    const until = Number(rawUntil)
    if (Number.isFinite(until) && until > 0) {
      result[key] = until
    }
  }

  return result
}

function emptyPersistedState(): PersistedState {
  return { tree: [], zoom: [], view: 'tree', suggestionHides: {} }
}

export function loadPersistedState(): PersistedState {
  return readParsedFromStorage(
    STORAGE_KEY,
    (value) => {
      const parsed = (value ?? {}) as Partial<PersistedState> & {
        suggestionHides?: unknown
      }

      return {
        tree:
          Array.isArray(parsed.tree) && parsed.tree.length
            ? normalizeTree(parsed.tree as TreeNode[])
            : [],
        zoom: Array.isArray(parsed.zoom) ? (parsed.zoom as Breadcrumb[]) : [],
        view: parsed.view === 'harvest' ? 'harvest' : 'tree',
        suggestionHides: normalizeSuggestionHides(parsed.suggestionHides),
      }
    },
    emptyPersistedState(),
  )
}

export function savePersistedState(state: PersistedState): void {
  writeJsonToStorage(STORAGE_KEY, state)
}
