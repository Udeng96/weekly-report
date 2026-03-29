import type { TreeNode } from '@weekly/shared'

export function treeToText(tree: TreeNode[]): string {
  const lines: string[] = []
  tree.forEach((l1) => {
    if (l1.text) lines.push(` - ${l1.text}`)
    ;(l1.children || []).forEach((l2) => {
      if (l2.text) lines.push(`  + ${l2.text}`)
      ;(l2.children || []).forEach((l3) => {
        if (l3.text) lines.push(`   : ${l3.text}`)
      })
    })
  })
  return lines.join('\n')
}

export function newId(): string | number {
  return Date.now() + Math.random()
}
