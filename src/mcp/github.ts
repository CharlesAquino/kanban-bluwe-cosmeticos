export async function createIssue({
  title,
  body,
  labels = []
}: {
  title: string
  body?: string
  labels?: string[]
}) {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO || 'bluwe/kanban-production' // Configure no .env

  // Se não tiver token, simula
  if (!token || token === 'seu_token_github') {
    await new Promise((r) => setTimeout(r, 100))
    console.log(`[MCP:github] createIssue SIMULADO: ${title} [${labels.join(', ')}]`)
    return { ok: true, url: `https://github.com/${repo}/issues/0` }
  }

  try {
    // Integração real com GitHub API
    const [owner, repoName] = repo.split('/')
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/issues`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body: body || '',
          labels,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`GitHub API error: ${response.status} - ${error}`)
    }

    const issue = await response.json()
    console.log(`[MCP:github] createIssue REAL: ${title} -> ${issue.html_url}`)
    return { ok: true, url: issue.html_url, number: issue.number }
  } catch (error) {
    console.error('[MCP:github] Error creating issue:', error)
    return { ok: false, error: String(error) }
  }
}
