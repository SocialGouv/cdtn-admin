-- Purge des alertes IDCC (DARES) restées "todo".
-- Beaucoup d'alertes erronées se sont accumulées lorsque le job DARES était
-- cassé (mauvais fichier téléchargé + ancien parseur sur le nouveau format
-- "Suivi historique"). Une fois le parseur corrigé, on repart d'une base propre :
-- le prochain run du job régénère uniquement le diff correct (added/removed).
delete from alerts
where repository = 'dares'
and status = 'todo';
