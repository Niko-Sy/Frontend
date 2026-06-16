export const isAdmin = (user) => user?.role === 'ADMIN'

export const isOwner = (item, user) => Boolean(user?.id && (item?.userId === user.id || item?.publisherId === user.id))

export const canClaim = (item, user) => {
  return Boolean(
    user &&
      item?.itemType === 'FOUND' &&
      !isOwner(item, user) &&
      ['AVAILABLE', 'CLAIMING'].includes(item?.status) &&
      !item?.hasApplied,
  )
}

export const canSubmitClue = (item, user) => {
  return Boolean(user && item?.itemType === 'LOST' && !isOwner(item, user) && item?.status === 'AVAILABLE')
}
