'use client'

import { useState } from 'react'
import { Plus, Trash2, Copy, Check, Key, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import type { McpApiKey } from '@/types/crm'

const ALL_SCOPES = [
  { value: 'read:contacts', label: 'Read Contacts' },
  { value: 'write:contacts', label: 'Write Contacts' },
  { value: 'read:deals', label: 'Read Deals' },
  { value: 'write:deals', label: 'Write Deals' },
  { value: 'read:activities', label: 'Read Activities' },
]

interface ApiKeysSettingsProps {
  initialKeys: McpApiKey[]
  canManage: boolean
}

export function ApiKeysSettings({ initialKeys, canManage }: ApiKeysSettingsProps) {
  const [keys, setKeys] = useState(initialKeys)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:contacts', 'read:deals', 'read:activities'])
  const [creating, setCreating] = useState(false)
  const [newPlainKey, setNewPlainKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newKeyName.trim() || selectedScopes.length === 0) return
    setCreating(true)
    const res = await fetch('/api/mcp-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName, scopes: selectedScopes }),
    })
    const json = await res.json()
    if (res.ok) {
      setKeys(prev => [json.data, ...prev])
      setNewPlainKey(json.data.plain_key)
      setNewKeyName('')
      setSelectedScopes(['read:contacts', 'read:deals', 'read:activities'])
    } else {
      toast.error(json.error?.message ?? 'Failed to create key')
    }
    setCreating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Revoke this API key? Any integrations using it will stop working.')) return
    const res = await fetch(`/api/mcp-keys/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setKeys(prev => prev.filter(k => k.id !== id))
      toast.success('Key revoked')
    } else {
      toast.error('Failed to revoke key')
    }
  }

  function copyKey() {
    if (!newPlainKey) return
    navigator.clipboard.writeText(newPlainKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleScope(scope: string) {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    )
  }

  return (
    <div className="space-y-6">
      {/* Revealed key banner */}
      {newPlainKey && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-300">Copy your API key now</p>
              <p className="text-xs text-amber-400/80 mt-0.5">This key will not be shown again.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-background/50 px-3 py-2 rounded border border-border truncate">
              {newPlainKey}
            </code>
            <Button size="sm" variant="outline" onClick={copyKey} className="shrink-0">
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </Button>
          </div>
          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setNewPlainKey(null)}>
            I&apos;ve saved it
          </Button>
        </div>
      )}

      {/* Existing keys */}
      <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
        {keys.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm">
            <Key size={18} className="opacity-40" />
            No API keys yet
          </div>
        )}
        {keys.map(key => (
          <div key={key.id} className="flex items-start gap-3 px-4 py-3">
            <Key size={14} className="text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{key.name}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {key.scopes.map(s => (
                  <Badge key={s} variant="secondary" className="text-xs py-0">{s}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Created {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}
                {key.last_used && ` · Last used ${formatDistanceToNow(new Date(key.last_used), { addSuffix: true })}`}
              </p>
            </div>
            {canManage && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleDelete(key.id)}
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Create new key */}
      {canManage && (
        <div className="rounded-lg border border-border p-4 space-y-4">
          <h3 className="text-sm font-medium">Create New Key</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Key name</Label>
              <Input
                className="h-8 text-sm"
                placeholder="e.g. Claude Desktop"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Scopes</Label>
              <div className="space-y-2">
                {ALL_SCOPES.map(scope => (
                  <div key={scope.value} className="flex items-center gap-2">
                    <Switch
                      checked={selectedScopes.includes(scope.value)}
                      onCheckedChange={() => toggleScope(scope.value)}
                      className="scale-75"
                    />
                    <span className="text-sm">{scope.label}</span>
                    <Badge variant="secondary" className="text-xs py-0 font-mono">{scope.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" size="sm" disabled={creating || !newKeyName.trim() || selectedScopes.length === 0}>
              <Plus size={13} className="mr-1" />{creating ? 'Creating…' : 'Create Key'}
            </Button>
          </form>

          {/* Claude Desktop config snippet */}
          <div className="rounded-md bg-muted/40 p-3 mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Claude Desktop config snippet</p>
            <pre className="text-xs font-mono text-foreground/80 overflow-x-auto whitespace-pre">{`{
  "mcpServers": {
    "miniCRM": {
      "url": "${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_KEY_HERE"
      }
    }
  }
}`}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
