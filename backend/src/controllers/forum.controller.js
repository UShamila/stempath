// src/controllers/forum.controller.js
const db = require('../db/QueryHelper')

// GET /api/forum
const getPosts = async (req, res) => {
  try {
    const { tag, limit = 30, offset = 0 } = req.query
    const conds  = []
    const params = []
    let pi = 1
    if (tag) { conds.push(`fp.tag = $${pi++}`); params.push(tag) }
    params.push(parseInt(limit), parseInt(offset))

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

    const posts = await db.queryAll(
      `SELECT fp.id, fp.title, fp.body, fp.tag, fp.likes, fp.is_pinned, fp.created_at, fp.updated_at,
              u.id AS author_id, u.full_name AS author_name, u.avatar_url AS author_avatar,
              (SELECT COUNT(*)::int FROM forum_replies fr WHERE fr.post_id = fp.id) AS reply_count
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       ${where}
       ORDER BY fp.is_pinned DESC, fp.created_at DESC
       LIMIT $${pi} OFFSET $${pi + 1}`,
      params
    )
    res.json(posts)
  } catch (err) {
    console.error('getPosts:', err)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
}

// GET /api/forum/:id
const getPost = async (req, res) => {
  try {
    const post = await db.queryOne(
      `SELECT fp.*, u.full_name AS author_name, u.avatar_url AS author_avatar
       FROM forum_posts fp JOIN users u ON fp.author_id = u.id
       WHERE fp.id = $1`, [req.params.id]
    )
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const replies = await db.queryAll(
      `SELECT fr.*, u.full_name AS author_name, u.avatar_url AS author_avatar
       FROM forum_replies fr JOIN users u ON fr.author_id = u.id
       WHERE fr.post_id = $1 ORDER BY fr.created_at ASC`, [req.params.id]
    )
    res.json({ ...post, replies })
  } catch (err) {
    console.error('getPost:', err)
    res.status(500).json({ error: 'Failed to fetch post' })
  }
}

// POST /api/forum
const createPost = async (req, res) => {
  try {
    const { title, body, tag } = req.body
    if (!title?.trim() || !body?.trim())
      return res.status(400).json({ error: 'Title and body are required' })

    const post = await db.queryOne(
      `INSERT INTO forum_posts (author_id, title, body, tag)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, title, body, tag || null]
    )
    res.status(201).json(post)
  } catch (err) {
    console.error('createPost:', err)
    res.status(500).json({ error: 'Failed to create post' })
  }
}

// POST /api/forum/:id/replies
const addReply = async (req, res) => {
  try {
    const { body } = req.body
    if (!body?.trim()) return res.status(400).json({ error: 'Reply body is required' })

    const post = await db.queryOne('SELECT id FROM forum_posts WHERE id=$1', [req.params.id])
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const reply = await db.queryOne(
      `INSERT INTO forum_replies (post_id, author_id, body)
       VALUES ($1,$2,$3) RETURNING *`,
      [req.params.id, req.user.id, body]
    )
    res.status(201).json(reply)
  } catch (err) {
    console.error('addReply:', err)
    res.status(500).json({ error: 'Failed to add reply' })
  }
}

// POST /api/forum/:id/like
const likePost = async (req, res) => {
  try {
    const post = await db.queryOne(
      'UPDATE forum_posts SET likes = likes + 1 WHERE id=$1 RETURNING likes',
      [req.params.id]
    )
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json({ likes: post.likes })
  } catch (err) {
    console.error('likePost:', err)
    res.status(500).json({ error: 'Failed to like post' })
  }
}

// DELETE /api/forum/:id  – author or admin
const deletePost = async (req, res) => {
  try {
    const post = await db.queryOne('SELECT * FROM forum_posts WHERE id=$1', [req.params.id])
    if (!post) return res.status(404).json({ error: 'Post not found' })
    if (post.author_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' })
    await db.query('DELETE FROM forum_posts WHERE id=$1', [req.params.id])
    res.json({ message: 'Post deleted' })
  } catch (err) {
    console.error('deletePost:', err)
    res.status(500).json({ error: 'Failed to delete post' })
  }
}

// GET /api/forum/tags
const getTags = async (req, res) => {
  try {
    const tags = await db.queryAll(
      `SELECT tag, COUNT(*)::int AS count FROM forum_posts
       WHERE tag IS NOT NULL GROUP BY tag ORDER BY count DESC LIMIT 20`
    )
    res.json(tags)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags' })
  }
}

module.exports = { getPosts, getPost, createPost, addReply, likePost, deletePost, getTags }
