'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
    if (error) toast.error(error.message)
    else { toast.success('Profile updated'); router.refresh() }
    setLoading(false)
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Display name</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
