import Fastify from 'fastify'
import fastifyMysql from '@fastify/mysql'
import fastifyHttpQuery from '@thecodepace/fastify-http-query'
import { blogsRoutes } from './routes/blogs.js'
import * as fs from 'fs'
import * as crypto from 'crypto'

function decryptSecret(encryptedPath, keyPath) {
  const file = fs.readFileSync(encryptedPath);
  const passphrase = fs.readFileSync(keyPath, 'utf8').trim();

  // OpenSSL "salted" format: 8-byte "Salted__" magic + 8-byte salt + ciphertext
  if (file.slice(0, 8).toString('ascii') !== 'Salted__') {
    throw new Error('Unexpected file format');
  }
  const salt = file.slice(8, 16);
  const ciphertext = file.slice(16);

  // Reproduce OpenSSL PBKDF2: HMAC-SHA256, 10,000 iterations, 48 bytes (key + IV)
  const keyIv = crypto.pbkdf2Sync(passphrase, salt, 10000, 48, 'sha256');
  const key = keyIv.slice(0, 32);
  const iv = keyIv.slice(32);

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  // Extract the value after '=' and return as a Buffer (mutable, wipable)
  const eq = decrypted.indexOf(0x3d);
  const value = Buffer.from(decrypted.slice(eq + 1));
  decrypted.fill(0);
  keyIv.fill(0);
  return value;
}

const fastify = Fastify({
  logger: true,
  trustProxy: '127.0.0.1'
})

const dbPassword = decryptSecret('secret.enc', '.secrets/key');

fastify.register(fastifyMysql, {
  promise: true,
  host: '127.0.0.1',
  user: 'app_user',
  password: dbPassword.toString().trim(),
  database: 'blogs',
  connectionLimit: 10
})

dbPassword.fill(0);

fastify.register(fastifyHttpQuery)

fastify.register(blogsRoutes)

fastify.get('/health', async () => {
  return {status: 'ok' }
})

try {
  await fastify.listen({ port: 3000, host: '127.0.0.1' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
