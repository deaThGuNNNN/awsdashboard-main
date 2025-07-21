#!/bin/bash

# Script de déploiement automatisé pour le Calculateur de Coûts AWS
# Usage: ./deploy-aws.sh [environment]

set -e

# Configuration
ENVIRONMENT=${1:-production}
BUCKET_NAME="calculateur-aws-costs-${ENVIRONMENT}"
DISTRIBUTION_ID=""  # À remplir avec votre ID de distribution CloudFront
REGION="eu-west-1"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI n'est pas installé"
        exit 1
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier les variables d'environnement Firebase
    if [ ! -f ".env.local" ]; then
        log_error "Fichier .env.local manquant"
        log_info "Créez le fichier .env.local avec vos variables Firebase"
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Installation des dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    npm ci
    log_success "Dépendances installées"
}

# Build de l'application
build_application() {
    log_info "Construction de l'application..."
    npm run build
    
    # Vérifier si le build existe
    if [ ! -d ".next" ]; then
        log_error "Échec du build"
        exit 1
    fi
    
    log_success "Application construite"
}

# Export statique
export_static() {
    log_info "Export statique..."
    
    # Configurer Next.js pour l'export statique
    cat > next.config.temp.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'out',
  experimental: {
    optimizeCss: true
  }
}

module.exports = nextConfig
EOF

    # Backup du config original
    if [ -f "next.config.mjs" ]; then
        mv next.config.mjs next.config.mjs.backup
    fi
    
    mv next.config.temp.js next.config.mjs
    
    # Export
    npx next export
    
    # Restaurer le config original
    if [ -f "next.config.mjs.backup" ]; then
        mv next.config.mjs.backup next.config.mjs
    fi
    
    log_success "Export statique terminé"
}

# Créer le bucket S3 si nécessaire
create_s3_bucket() {
    log_info "Vérification du bucket S3..."
    
    if aws s3 ls "s3://${BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
        log_info "Création du bucket S3: ${BUCKET_NAME}"
        aws s3 mb "s3://${BUCKET_NAME}" --region "${REGION}"
        
        # Configurer pour hébergement web statique
        aws s3 website "s3://${BUCKET_NAME}" \
            --index-document index.html \
            --error-document 404.html
            
        log_success "Bucket S3 créé"
    else
        log_info "Bucket S3 existe déjà"
    fi
}

# Upload vers S3
upload_to_s3() {
    log_info "Upload vers S3..."
    
    # Sync des fichiers
    aws s3 sync ./out "s3://${BUCKET_NAME}" \
        --delete \
        --cache-control "max-age=86400" \
        --metadata-directive REPLACE
    
    # Optimiser les headers de cache pour les assets statiques
    aws s3 cp ./out "s3://${BUCKET_NAME}" \
        --recursive \
        --cache-control "public, max-age=31536000, immutable" \
        --exclude "*.html" \
        --exclude "*.txt" \
        --metadata-directive REPLACE
    
    # Headers spéciaux pour HTML (pas de cache)
    aws s3 cp ./out "s3://${BUCKET_NAME}" \
        --recursive \
        --cache-control "public, max-age=0, must-revalidate" \
        --include "*.html" \
        --metadata-directive REPLACE
    
    log_success "Upload terminé"
}

# Configurer les permissions du bucket
configure_bucket_permissions() {
    log_info "Configuration des permissions..."
    
    # Politique de bucket pour accès public en lecture
    cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF

    aws s3api put-bucket-policy \
        --bucket "${BUCKET_NAME}" \
        --policy file://bucket-policy.json
    
    # Supprimer le fichier temporaire
    rm bucket-policy.json
    
    log_success "Permissions configurées"
}

# Invalidation CloudFront
invalidate_cloudfront() {
    if [ -n "${DISTRIBUTION_ID}" ]; then
        log_info "Invalidation du cache CloudFront..."
        aws cloudfront create-invalidation \
            --distribution-id "${DISTRIBUTION_ID}" \
            --paths "/*"
        log_success "Invalidation CloudFront lancée"
    else
        log_warning "DISTRIBUTION_ID non configuré - invalidation CloudFront ignorée"
    fi
}

# Afficher les informations de déploiement
show_deployment_info() {
    log_success "🚀 Déploiement terminé!"
    echo ""
    log_info "Informations de déploiement:"
    echo "  Environment: ${ENVIRONMENT}"
    echo "  Bucket S3: ${BUCKET_NAME}"
    echo "  Région: ${REGION}"
    echo "  URL S3: http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"
    
    if [ -n "${DISTRIBUTION_ID}" ]; then
        echo "  CloudFront: ${DISTRIBUTION_ID}"
    fi
    
    echo ""
    log_info "Pour configurer un domaine personnalisé:"
    echo "  1. Créer une distribution CloudFront"
    echo "  2. Configurer Route 53"
    echo "  3. Ajouter un certificat SSL"
    echo ""
}

# Fonction de nettoyage en cas d'erreur
cleanup() {
    log_error "Erreur détectée - nettoyage..."
    
    # Restaurer le config original si backup existe
    if [ -f "next.config.mjs.backup" ]; then
        mv next.config.mjs.backup next.config.mjs
    fi
    
    # Supprimer les fichiers temporaires
    rm -f bucket-policy.json
    rm -f next.config.temp.js
}

# Trap pour le nettoyage
trap cleanup ERR

# Fonction principale
main() {
    echo "🚀 Déploiement du Calculateur de Coûts AWS"
    echo "Environment: ${ENVIRONMENT}"
    echo ""
    
    check_prerequisites
    install_dependencies
    build_application
    export_static
    create_s3_bucket
    configure_bucket_permissions
    upload_to_s3
    invalidate_cloudfront
    show_deployment_info
}

# Exécution du script principal
main "$@" 