# Gestion des fichiers dans les différents environemments

Les url des fichiers sauvegardée en base sont relatives. 
Pour chaque environnement, il faudra spécifier, l'url du serveur ainsi que le nom du container.

## Organisation

### cdtn

déploiement | container | instance azure
- | - | -
branche | cdtn-dev | dev
master | cdtn | dev
preprod | cdtn | dev 
prod | cdtn | prod

### cdtn-admin

déploiement | container | instance
- | - | -
branche | cdtn-dev | dev
master | cdtn | dev
	
## Synchronisation (job ci de copie)

### cdtn

__mep__ : copie des fichiers cdtn (dev) › cdtn (prod)
__ingest (prod)__ : copie les fichier de cdtn (dev) › cdtn (prod)

### cdtn-admin

__branche__: copie de cdtn (dev) › cdtn-dev (dev)
