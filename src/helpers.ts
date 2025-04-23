import { BinaryLike, createHash } from 'crypto'

export function hash(dado: BinaryLike) {
  return createHash('sha256').update(dado).digest('hex')
}

export function validateHash({
  hash,
  difficulty = 4,
  prefixPow = '0'
}: {
  hash: string
  difficulty: number
  prefixPow: string
}) {
  const check = prefixPow.repeat(difficulty)

  return hash.startsWith(check)
}
