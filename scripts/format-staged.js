import { execSync, spawnSync } from 'child_process';

try {
  // 1) Récupérer les fichiers staged (ajoutés/copés/modifiés/renommés)
  const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    encoding: 'utf8',
  }).trim();

  if (!output) {
    console.log('✅ Aucun fichier staged à formater.');
    process.exit(0);
  }

  const files = output
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  // 2) Filtrer les extensions gérées par Prettier
  const prettierExt = /\.(js|jsx|ts|tsx|json|md|css|scss|html|yml|yaml)$/i;
  const filesToFormat = files.filter((f) => prettierExt.test(f));

  if (filesToFormat.length === 0) {
    console.log('✅ Aucun fichier staged compatible Prettier.');
    process.exit(0);
  }

  // 3) Lancer Prettier
  const prettierCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const prettier = spawnSync(prettierCmd, ['prettier', '--write', ...filesToFormat], {
    stdio: 'inherit',
  });

  if (prettier.status !== 0) {
    console.error('❌ Échec du formatage Prettier.');
    process.exit(prettier.status || 1);
  }

  // 4) Re-stager les fichiers formatés
  const add = spawnSync('git', ['add', ...filesToFormat], { stdio: 'inherit' });
  if (add.status !== 0) {
    console.error('❌ Échec du git add après formatage.');
    process.exit(add.status || 1);
  }

  console.log('✅ Fichiers staged formatés et re-stagés.');
  process.exit(0);
} catch (error) {
  console.error('❌ Erreur format-staged:', error.message);
  process.exit(1);
}