'use client'

import { useState } from 'react'
import type { Profile, Collection, UserPurchase } from '@/types'
import GrantAccessButton from './grant-access-button'

interface UsersListProps {
  profiles: Profile[]
  collections: Collection[]
  purchases: UserPurchase[]
}

export default function UsersList({ profiles, collections, purchases }: UsersListProps) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

  const getPurchasedCollections = (userId: string) => {
    return purchases
      .filter(p => p.user_id === userId)
      .map(p => p.collection_id)
  }

  return (
    <div className="border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Full Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Collections
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {profiles.map((profile) => {
              const purchasedIds = getPurchasedCollections(profile.id)
              const purchasedCollections = collections.filter(c => purchasedIds.includes(c.id))
              const isExpanded = expandedUserId === profile.id

              return (
                <>
                  <tr key={profile.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-neutral-600">{profile.email}</td>
                    <td className="px-6 py-4 text-sm text-neutral-900 font-medium">
                      {profile.full_name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${profile.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'}`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {purchasedCollections.length === 0 ? (
                        <span className="text-neutral-400">No access</span>
                      ) : (
                        <div className="space-y-1">
                          {purchasedCollections.map(c => (
                            <div key={c.id} className="text-xs inline-block bg-neutral-100 px-2 py-1 rounded mr-2 mb-1">
                              {c.name ?? c.city}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setExpandedUserId(isExpanded ? null : profile.id)}
                        className="text-neutral-600 hover:text-neutral-900 underline"
                      >
                        {isExpanded ? 'Hide' : 'Manage'}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 bg-neutral-50">
                        <div className="space-y-4">
                          <p className="text-xs font-medium text-neutral-600 uppercase tracking-widest">
                            Grant or Revoke Collections
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {collections.map((collection) => {
                              const hasPurchase = purchasedIds.includes(collection.id)

                              return (
                                <GrantAccessButton
                                  key={collection.id}
                                  userId={profile.id}
                                  collectionId={collection.id}
                                  collectionName={collection.name ?? collection.city}
                                  hasPurchase={hasPurchase}
                                />
                              )
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          No users found.
        </div>
      )}
    </div>
  )
}
