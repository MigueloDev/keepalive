async function ping(env) {
  const url = `${env.BACKEND_URL.replace(/\/$/, '')}/health`
  const start = Date.now()
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'victorialeads-keepalive' },
      signal: AbortSignal.timeout(90_000),
    })
    const ms = Date.now() - start
    const result = { ok: res.ok, status: res.status, ms }
    if (res.ok) console.log(result)
    else console.error(result)
    return result
  } catch (error) {
    const ms = Date.now() - start
    const result = { ok: false, error: String(error), ms }
    console.error(result)
    return result
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(ping(env))
  },
  async fetch(request, env) {
    const result = await ping(env)
    return Response.json(result, { status: result.ok ? 200 : 502 })
  },
}
