// Helper wrapper script to execute seeder from the root workspace
import path from 'path'
import { spawn } from 'child_process'

const serverDir = path.join(__dirname, '..', 'server')
const child = spawn('npx', ['ts-node', 'src/seeders/seedCoreMissions.ts'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
})

child.on('exit', (code) => {
  process.exit(code || 0)
})
