const blogSchema = {
  body: {
    type: 'object',
    required: ['title', 'content', 'category'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      content: { type: 'string' },
      category: { type: 'string', minLength: 1, maxLength: 100 }
    },
    additionalProperties: false
  }
}

export async function blogsRoutes(fastify) {
  // CREATE
  fastify.post('/blogs', { schema: blogSchema }, async (request, reply) => {
    const { title, content, category } = request.body
    const [result] = await fastify.mysql.query(
      'INSERT INTO Posts (Title, Content, Category) VALUES (?, ?, ?)',
      [title, content, category]
    )
    reply.code(201)
    return { id: result.insertId, title, content, category }
  })

  // READ all
  fastify.get('/blogs', async () => {
    const [rows] = await fastify.mysql.query(
      'SELECT PostID, Title, Content, PublicationDate FROM Posts ORDER BY PostID DESC'
    )
    return rows
  })

  // READ one
  fastify.get('/blogs/:id', async (request, reply) => {
    const [rows] = await fastify.mysql.query(
      'SELECT PostID, Title, Content, PublicationDate FROM Posts WHERE PostID = ?',
      [request.params.id]
    )
    if (rows.length === 0) {
      reply.code(404)
      return { error: 'blog not found' }
    }
    return rows[0]
  })

  // UPDATE
  fastify.put('/blogs/:id', { schema: blogSchema }, async (request, reply) => {
    const { title, content, category } = request.body
    const [result] = await fastify.mysql.query(
      'UPDATE Posts SET Title = ?, Content = ?, Category = ? WHERE PostID = ?',
      [title, content, category, request.params.id]
    )
    if (result.affectedRow === 0) {
      reply.code(404)
      return { error: 'blog not found' }
    }
    reply.code(204)
  })
}
