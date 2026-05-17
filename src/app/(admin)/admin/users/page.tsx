import { createAdminClient } from '@/lib/supabase/admin'
import UsersList from './users-list'

export default async function UsersPage() {
  const supabase = createAdminClient()

  // Fetch all users with their purchases
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all collections
  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all purchases
  const { data: purchases } = await supabase
    .from('user_purchases')
    .select('*')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light text-neutral-900 mb-2">Users</h1>
        <p className="text-neutral-600">Manage user accounts and collection access.</p>
      </div>

      <UsersList
        profiles={profiles || []}
        collections={collections || []}
        purchases={purchases || []}
      />
    </div>
  )
}
