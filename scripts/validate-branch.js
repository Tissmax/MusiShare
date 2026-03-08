// scripts/validate-branch.js
import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

try {
  // 1. Récupérer le nom de la branche actuelle via Git
  const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

  // 2. Liste des branches à ignorer (pas de validation ici)
  const ignoredBranches = ['main', 'develop', 'master', 'release'];
  if (ignoredBranches.includes(branchName)) {
    process.exit(0);
  }

  // 3. Regex : type (feat/fix/chore) / service / description
  // On capture le type dans $1 et le service dans $2
  const branchRegex = /^(feat|fix|chore)\/([a-z0-9-]+)\/.+/;
  const match = branchName.match(branchRegex);

  if (!match) {
    console.error('\n❌ [NOM DE BRANCHE INVALIDE]');
    console.error(`Branch: "${branchName}"`);
    console.error('👉 Format requis : type/nom-du-service/description');
    console.error('👉 Exemple : feat/auth-api/login-social\n');
    process.exit(1);
  }

  const [, type, serviceName] = match;
  const servicePath = join(__dirname, '..', 'apps', serviceName);

  // 4. Vérifier si le dossier du service existe réellement
  if (!existsSync(servicePath)) {
    console.error(`\n❌ [SERVICE INEXISTANT]`);
    console.error(`Le service "${serviceName}" n'a pas été trouvé dans /apps.`);
    
    const availableServices = readdirSync(join(__dirname, '..', 'apps'))
      .filter(f => statSync(join(__dirname, '..', 'apps', f)).isDirectory());
      
    console.error(`📍 Services valides : ${availableServices.join(', ')}\n`);
    process.exit(1);
  }

  console.log(`\n✅ Branche valide : Type [${type}] pour le service [${serviceName}]\n`);
  process.exit(0);

} catch (error) {
  // Si git n'est pas dispo ou autre erreur système
  console.error('Erreur lors de la validation de la branche:', error.message);
  process.exit(1);
}