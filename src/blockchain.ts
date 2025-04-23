import { headers } from 'next/headers'
import { hash, validateHash } from './helpers'

export interface Block {
  header: {
    nonce: number
    hashBlock: string
  }
  payload: {
    sequence: number
    timestamp: number
    data: any
    previousHash: string
  }
}

export class Blockchain {
  #chain: Block[] = []
  private prefixPow = '0'

  constructor(private readonly difficulty: number = 4) {
    this.#chain.push(this.createGenesisBlock())
  }

  private createGenesisBlock(): Block {
    const payload = {
      sequence: 0,
      timestamp: +new Date(),
      data: 'Inicial Block',
      previousHash: ''
    }

    return {
      header: {
        nonce: 0,
        hashBlock: hash(JSON.stringify(payload))
      },
      payload
    }
  }

  get chain(){
    return this.#chain
  }

  private get lastBLock(): Block {
    return this.#chain.at(-1) as Block
  }

  private hashLastBLock() {
    return this.lastBLock.header.hashBlock
  }

  creatBlock(data: any): Block['payload'] {
    const newBlock = {
      sequence: this.lastBLock.payload.sequence + 1,
      timestamp: +new Date(),
      data,
      previousHash: this.hashLastBLock()
    }

    console.log(`Block #${newBlock.sequence} create: ${JSON.stringify(newBlock)}`)

    return newBlock
  }

  minerBlock(block: Block['payload']) {
    let nonce = 0
    let start = +new Date()

    while (true) {
      const hashBlock = hash(JSON.stringify(block))
      const hashPow = hash(hashBlock + nonce)
      if (
        validateHash({
          hash: hashPow,
          difficulty: this.difficulty,
          prefixPow: this.prefixPow
        })
      ) {
        const final = +new Date()
        const hashReduced = hashBlock.slice(0, 12)
        const timeMining = (final - start) / 1000

        console.log(`Block #${block.sequence} mined in ${timeMining}s. Has is ${hashReduced} (${nonce} attempts)`)

        return {
          blockMined: {
            payload: { ...block },
            header: {
              nonce,
              hashBlock
            }
          }
        }
      } else {
        nonce++
      }
    }
  }

  checkBlock(block: Block): boolean {
    if (block.payload.previousHash !== this.hashLastBLock()) {
      console.error(
        `Invaid Block #${block.payload.sequence}. The previous hash is ${this.hashLastBLock().slice(
          0,
          12
        )} and not ${block.payload.previousHash.slice(0, 12)} `
      )
      return false
    }

    const hashTest = hash(hash(JSON.stringify(block.payload)) + block.header.nonce)
    if (
      !validateHash({
        hash: hashTest,
        difficulty: this.difficulty,
        prefixPow: this.prefixPow
      })
    ) {
      console.error(`Invaid Block #${block.payload.sequence}. The nonce is invalid: ${block.header.nonce}`)
      return false 
    }
    return true
  }

  sendBlock(block: Block): Block[] {
    if (this.checkBlock(block)) {
      this.#chain.push(block)
      console.log(`The block #${block.payload.sequence} was added to blockchain: ${JSON.stringify(block, null, 2)}`)
    }
    return this.#chain
  }
}
