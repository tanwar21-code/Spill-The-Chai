
export type UserProfile = {
  id: string
  username: string
  created_at: string
}

export type Confession = {
  id: string
  content: string
  author_id: string | null
  upvotes: number
  downvotes: number
  created_at: string
}

export type Vote = {
  id: string
  user_id: string
  confession_id: string
  vote_type: 1 | -1
  created_at: string
}

export type Comment = {
  id: string
  confession_id: string
  parent_id: string | null
  content: string
  created_at: string
}
