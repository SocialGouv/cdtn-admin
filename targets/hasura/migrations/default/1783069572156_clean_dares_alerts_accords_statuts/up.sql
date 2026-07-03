-- Purge des alertes IDCC (DARES) restées "todo".
-- Avant ce correctif, les accords d'entreprise / statuts particuliers (onglet
-- "Accords et statuts" du fichier DARES, ex. IDCC 5623 "France active"),
-- présents dans notre base mais absents des conventions de branche parsées,
-- étaient remontés à tort comme "à supprimer". Le parseur exclut désormais ces
-- accords/statuts EN VIGUEUR des suppressions : on repart d'une base propre pour
-- que le prochain run du job ne régénère que le diff correct (added/removed).
-- Même purge que la migration précédente 1782950400000_clean_dares_alerts_todo,
-- rejouée après ce nouveau correctif.
delete from alerts
where repository = 'dares'
and status = 'todo';
